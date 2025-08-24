
# Image Processing & Posts API

## A brief description of what this project does

This project provides a comprehensive API that serves two main purposes:

### Image Processing
An API that can be used in two different ways:
- As a simple placeholder API that allows you to place images into your frontend with the size set via URL parameters for rapid prototyping
- As a library to serve properly scaled versions of your images to reduce page load size
Rather than needing to resize and upload multiple copies of the same image, the API handles resizing and serving stored images for you.

### Posts Management
A complete posts/blog system that allows you to:
- Create, read, update, and delete posts with rich metadata
- Organize posts by categories and tags
- Search through posts by title, content, or tags
- Filter posts by various criteria
- Support for draft and published statuses 



## API Reference

### Image Processing Endpoints

#### Resize an existing image

```http
  GET /api/images
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `filename` | `string` | **Required**. Image name to resize (without extension) |
| `height` | `number` | **Required**. Image height |
| `width` | `number` | **Required**. Image width |

#### Upload a new image

```http
  POST /api/images
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `image` | `file` | **Required**. Image file to upload (form-data) |
| `autoProcess` | `boolean` | **Optional**. Auto-process image during upload |
| `width` | `number` | **Optional**. Width for auto-processing |
| `height` | `number` | **Optional**. Height for auto-processing |
| `quality` | `number` | **Optional**. Quality for auto-processing (1-100) |

#### List all available images

```http
  GET /api/images/list
```

Returns a JSON list of all available images in the system.

### Posts Management Endpoints

#### Create a new post

```http
  POST /api/posts
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `title` | `string` | **Required**. Post title |
| `content` | `string` | **Required**. Post content |
| `author` | `string` | **Required**. Author name |
| `category` | `string` | **Required**. Post category |
| `tags` | `array` | **Optional**. Array of tags |
| `status` | `string` | **Optional**. "draft" or "published" (default: "draft") |
| `imageUrl` | `string` | **Optional**. Featured image URL |

#### Get all posts

```http
  GET /api/posts
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `category` | `string` | **Optional**. Filter by category |
| `status` | `string` | **Optional**. Filter by status ("draft" or "published") |
| `author` | `string` | **Optional**. Filter by author |
| `tag` | `string` | **Optional**. Filter by tag |
| `limit` | `number` | **Optional**. Number of posts per page (default: 10) |
| `offset` | `number` | **Optional**. Number of posts to skip (default: 0) |

#### Get a specific post

```http
  GET /api/posts/:id
```

#### Update a post

```http
  PUT /api/posts/:id
```

Same parameters as create post (all optional for updates).

#### Delete a post

```http
  DELETE /api/posts/:id
```

#### Search posts

```http
  GET /api/posts/search/:query
```

Searches through post titles, content, and tags.

#### Get categories

```http
  GET /api/posts/meta/categories
```

Returns all unique categories.

#### Get tags

```http
  GET /api/posts/meta/tags
```

Returns all unique tags.




## Run Locally

Clone the project

```bash
  git clone https://github.com/abdulrahman9901/Image-Processing-API.git
```

Go to the project directory

```bash
  cd Image-Processing-API
```

Install dependencies

```bash
  npm install
```

build the project

```bash
  npm run build
```

Start the server on development mode

```bash
  npm run start-dev
```

Start the server on production mode

```bash
  npm run start-prod
```

## Running Tests

To run tests, run the following command

```bash
  npm run test
```


## Usage/Examples

The project will be running at your local server port 3000 unless you changed it.

### Resize existing images:
```http
http://localhost:3000/api/images?filename=icelandwaterfall&height=100&width=300
```

### Upload new images:
```bash
curl -X POST \
  http://localhost:3000/api/images \
  -F "image=@/path/to/your/image.jpg" \
  -F "autoProcess=true" \
  -F "width=500" \
  -F "height=300"
```

### List available images:
```http
http://localhost:3000/api/images/list
```

### Test the functionality:
- Open `test-upload.html` in your browser to test image processing endpoints
- Open `test-posts.html` in your browser to test posts management endpoints

### API Response Format:
All API endpoints return JSON responses with a consistent format:
```json
{
  "success": true|false,
  "message": "Human readable message",
  "data": {...},
  "error": "Error message (if success is false)"
}
```

### Posts Data Structure:
```json
{
  "id": "unique_post_id",
  "title": "Post Title",
  "content": "Post content...",
  "author": "Author Name",
  "category": "Category",
  "tags": ["tag1", "tag2"],
  "status": "published",
  "imageUrl": "optional_image_url",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

