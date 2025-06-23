# Categories API Usage Guide

## Overview
The categories endpoint has been simplified to only store category names. Categories are no longer tied to specific countries, seasons, or genders. This makes the system more flexible and allows products to be mapped to countries and seasons independently of their categories.

## API Endpoints

### GET `/api/categories`
Get all categories, sorted alphabetically by name.

**Response:**
```json
[
  {
    "id": "category-id-1",
    "name": "Casual",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "category-id-2",
    "name": "Electronics",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "category-id-3",
    "name": "Formal",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET `/api/categories/:id`
Get a specific category by ID, including its associated products.

**Response:**
```json
{
  "id": "category-id-1",
  "name": "Casual",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "products": [
    {
      "id": "product-id-1",
      "name": "Summer T-Shirt",
      "price": 25.99,
      "imageUrl": "https://example.com/tshirt.jpg"
    }
  ]
}
```

### POST `/api/categories`
Create a new category.

**Request Body:**
```json
{
  "name": "Sports"
}
```

**Response:**
```json
{
  "id": "new-category-id",
  "name": "Sports",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - Category name is required
- `409` - Category with this name already exists

### PUT `/api/categories/:id`
Update an existing category.

**Request Body:**
```json
{
  "name": "Updated Category Name"
}
```

**Response:**
```json
{
  "id": "category-id",
  "name": "Updated Category Name",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - Category name is required
- `404` - Category not found
- `409` - Category with this name already exists

### DELETE `/api/categories/:id`
Delete a category. Cannot delete categories that have associated products.

**Response:**
```json
{
  "message": "Category deleted successfully"
}
```

**Error Responses:**
- `400` - Cannot delete category with existing products
- `404` - Category not found

## Frontend Usage Examples

### Fetching All Categories
```javascript
const getCategories = async () => {
  const response = await fetch('/api/categories');
  return response.json();
};

// Usage
const categories = await getCategories();
console.log(categories); // Array of category objects
```

### Creating a New Category
```javascript
const createCategory = async (name) => {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // If authentication is required
    },
    body: JSON.stringify({ name })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return response.json();
};

// Usage
try {
  const newCategory = await createCategory('Books');
  console.log('Category created:', newCategory);
} catch (error) {
  console.error('Error creating category:', error.message);
}
```

### Updating a Category
```javascript
const updateCategory = async (id, name) => {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return response.json();
};
```

### Deleting a Category
```javascript
const deleteCategory = async (id) => {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return response.json();
};
```

## Schema Changes

### Before (Complex Categories)
```prisma
model Category {
  id        String   @id @default(cuid())
  name      String
  gender    Gender   // enum: MALE, FEMALE, KIDS
  countryId String
  seasonId  String
  products Product[]
  country   Country  @relation(fields: [countryId], references: [id])
  season    Season   @relation(fields: [seasonId], references: [id])
  createdAt DateTime @default(now())
}
```

### After (Simplified Categories)
```prisma
model Category {
  id        String   @id @default(cuid())
  name      String   // e.g., Casual, Formal, Electronics, Books, etc.
  products Product[]
  createdAt DateTime @default(now())
}
```

## Benefits of Simplified Categories

1. **Flexibility**: Categories are no longer tied to specific countries, seasons, or genders
2. **Reusability**: The same category can be used across different countries and seasons
3. **Simplicity**: Easier to manage and understand
4. **Product-Level Control**: Products can be mapped to countries and seasons independently
5. **Better Organization**: Categories represent actual product types rather than location/time-specific groupings

## Migration Impact

- **Database**: All existing category relationships with countries and seasons have been removed
- **API**: Category endpoints now only handle name-based operations
- **Products**: Product filtering by country and season now uses direct product relationships
- **Trending**: Trending by country now filters products by their country relationships rather than category relationships

This change makes the system more intuitive and flexible for managing product catalogs across different geographical and seasonal contexts.