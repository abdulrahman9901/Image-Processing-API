import express from 'express';
import { promises as fsPromises, constants } from 'fs';
import { Readable } from 'stream';
import { Request, Response } from 'express';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { Imageprocessing } from '../../utilities';

const images = express.Router();

const MAX_DIM = parseInt(process.env.MAX_IMAGE_DIMENSION || '4096', 10);
const ALLOWED_PREFIXES = (process.env.ALLOWED_KEY_PREFIXES || 'uploads/')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

function normalizeKey(raw: string): string {
    let k = raw.trim();
    try {
        if (k.includes('://')) {
            const u = new URL(k);
            k = u.pathname.replace(/^\/+/, '');
        }
    } catch {
        /* treat as plain key */
    }
    return k.replace(/^\/+/, '');
}

function keyAllowed(normalized: string): boolean {
    return ALLOWED_PREFIXES.some((prefix) => normalized.startsWith(prefix.replace(/^\/+/, '')));
}

async function streamToBuffer(body: unknown): Promise<Buffer> {
    if (!body) {
        throw new Error('EMPTY_BODY');
    }
    if (Buffer.isBuffer(body)) {
        return body;
    }
    if (body instanceof Uint8Array) {
        return Buffer.from(body);
    }
    const stream = body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}

function s3Configured(): boolean {
    return Boolean(
        process.env.S3_BUCKET &&
            process.env.AWS_ACCESS_KEY_ID &&
            process.env.AWS_SECRET_ACCESS_KEY
    );
}

async function fetchS3Object(normalizedKey: string): Promise<Buffer> {
    if (!s3Configured()) {
        throw new Error('S3_NOT_CONFIGURED');
    }
    const region = process.env.AWS_REGION || 'us-east-1';
    const client = new S3Client({ region });
    const out = await client.send(
        new GetObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: normalizedKey,
        })
    );
    return streamToBuffer(out.Body);
}

async function checkLocalFullExists(filename: string): Promise<boolean> {
    try {
        await fsPromises.access(`./assets/full/${filename}.jpg`, constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

images.get('/images', async (req: Request, res: Response): Promise<void> => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const keyRaw = typeof req.query.key === 'string' ? req.query.key : undefined;
    const filename = typeof req.query.filename === 'string' ? req.query.filename : undefined;
    const wStr = req.query.width as string | undefined;
    const hStr = req.query.height as string | undefined;

    if (!keyRaw && !filename) {
        res.status(400).send('Provide key or filename');
        return;
    }

    const width = parseInt(String(wStr), 10);
    const height = parseInt(String(hStr), 10);

    if (Number.isNaN(width) || width < 1 || Number.isNaN(height) || height < 1) {
        res.status(400).send('width and height must be positive integers');
        return;
    }

    if (width > MAX_DIM || height > MAX_DIM) {
        res.status(400).send('requested dimensions exceed maximum');
        return;
    }

    if (keyRaw) {
        const normalized = normalizeKey(keyRaw);
        if (!normalized || !keyAllowed(normalized)) {
            res.status(400).send('invalid key');
            return;
        }
        try {
            const src = await fetchS3Object(normalized);
            const outBuf = await sharp(src).resize(width, height).toBuffer();
            const meta = await sharp(outBuf).metadata();
            const fmt = meta.format || 'jpeg';
            res.status(200);
            res.setHeader('Content-Type', `image/${fmt === 'jpeg' ? 'jpeg' : fmt}`);
            res.send(outBuf);
        } catch (err: unknown) {
            const e = err as { name?: string; Code?: string; message?: string };
            if (e.name === 'NoSuchKey' || e.Code === 'NoSuchKey' || e.name === 'NotFound') {
                res.status(404).send('not found');
                return;
            }
            if (e.message === 'S3_NOT_CONFIGURED') {
                res.status(500).send('storage not configured for key-based access');
                return;
            }
            res.status(500).send('processing failed');
        }
        return;
    }

    if (!filename) {
        res.status(400).send('Provide key or filename');
        return;
    }

    if (!(await checkLocalFullExists(filename))) {
        res.status(404).send('not found');
        return;
    }

    const result = await Imageprocessing(filename, width, height);
    if (typeof result === 'string') {
        res.status(500).send(result);
        return;
    }
    res.status(200);
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(result);
});

export default images;
