# Product API Usage Guide

## Overview
The product endpoints now support mapping products to multiple countries and seasons. This allows for better filtering and organization of products based on geographical and seasonal requirements.

## Create Product Endpoint

### POST `/api/products`

Creates a new product with optional country and season mappings.

**Request Body:**
```json
{
  "name": "Summer T-Shirt",
  "description": "Lightweight cotton t-shirt perfect for summer",
  "imageUrl": "https://example.com/tshirt.jpg",
  "price": 25.99,
  "availableSizes": ["S", "M", "L", "XL"],
  "gender": "Unisex",
  "categoryId": "category-id-here",
  "deliveryType": "HOME",
  "type": "Clothing",
  "countryIds": ["country-id-1", "country-id-2"],
  "seasonIds": ["season-id-1", "season-id-2"]
}
```

**Response:**
```json
{
  "id": "product-id",
  "name": "Summer T-Shirt",
  "description": "Lightweight cotton t-shirt perfect for summer",
  "imageUrl": "https://example.com/tshirt.jpg",
  "price": 25.99,
  "availableSizes": ["S", "M", "L", "XL"],
  "gender": "Unisex",
  "categoryId": "category-id-here",
  "deliveryType": "HOME",
  "type": "Clothing",
  "category": {
    "id": "category-id-here",
    "name": "Casual",
    "gender": "Unisex"
  },
  "countries": [
    {
      "id": "country-id-1",
      "name": "United States",
      "code": "US"
    },
    {
      "id": "country-id-2",
      "name": "Canada",
      "code": "CA"
    }
  ],
  "seasons": [
    {
      "id": "season-id-1",
      "season": "Summer",
      "start": "June",
      "end": "August"
    },
    {
      "id": "season-id-2",
      "season": "Spring",
      "start": "March",
      "end": "May"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Get Products Endpoint

### GET `/api/products`

Retrieves products with optional filtering by country and season.

**Query Parameters:**
- `categoryId` - Filter by category ID
- `gender` - Filter by gender (Male, Female, Kids, Unisex)
- `deliveryType` - Filter by delivery type (HOME, ON_ARRIVAL)
- `countryId` - Filter by country ID
- `seasonId` - Filter by season ID
- `type` - Filter by product type

**Example Requests:**
```
GET /api/products?countryId=country-id-1&seasonId=season-id-1
GET /api/products?gender=Male&countryId=country-id-2
GET /api/products?categoryId=category-id&seasonId=season-id-1
```

**Response:**
```json
[
  {
    "id": "product-id",
    "name": "Summer T-Shirt",
    "description": "Lightweight cotton t-shirt perfect for summer",
    "imageUrl": "https://example.com/tshirt.jpg",
    "price": 25.99,
    "availableSizes": ["S", "M", "L", "XL"],
    "gender": "Unisex",
    "categoryId": "category-id-here",
    "deliveryType": "HOME",
    "type": "Clothing",
    "category": {
      "id": "category-id-here",
      "name": "Casual",
      "gender": "Unisex"
    },
    "countries": [
      {
        "id": "country-id-1",
        "name": "United States",
        "code": "US"
      }
    ],
    "seasons": [
      {
        "id": "season-id-1",
        "season": "Summer",
        "start": "June",
        "end": "August"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## Admin Update Product Endpoint

### PUT `/api/admin/products/:id`

Updates an existing product, including country and season mappings.

**Request Body:**
```json
{
  "name": "Updated Summer T-Shirt",
  "description": "Updated description",
  "price": 29.99,
  "countryIds": ["new-country-id-1", "new-country-id-2"],
  "seasonIds": ["new-season-id-1"]
}
```

**Note:** When updating countries or seasons, the existing relationships will be replaced with the new ones provided.

## Frontend Usage Examples

### Creating a Product with Multiple Countries and Seasons

```javascript
const createProduct = async (productData) => {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Winter Jacket',
      description: 'Warm winter jacket',
      imageUrl: 'https://example.com/jacket.jpg',
      price: 89.99,
      availableSizes: ['M', 'L', 'XL'],
      gender: 'Unisex',
      categoryId: 'winter-category-id',
      deliveryType: 'HOME',
      type: 'Outerwear',
      countryIds: ['us-id', 'canada-id', 'uk-id'],
      seasonIds: ['winter-season-id']
    })
  });
  
  return response.json();
};
```

### Fetching Products by Country and Season

```javascript
const getProductsByLocation = async (countryId, seasonId) => {
  const params = new URLSearchParams();
  if (countryId) params.append('countryId', countryId);
  if (seasonId) params.append('seasonId', seasonId);
  
  const response = await fetch(`/api/products?${params.toString()}`);
  return response.json();
};

// Usage
const products = await getProductsByLocation('us-id', 'summer-season-id');
```

## Database Schema Relationships

The product mapping works through many-to-many relationships:

- **Product ↔ Country**: A product can be available in multiple countries, and a country can have multiple products
- **Product ↔ Season**: A product can be suitable for multiple seasons, and a season can have multiple products
- **Product → Category**: A product belongs to one category (many-to-one relationship)

This structure allows for flexible product organization and efficient filtering based on geographical and seasonal requirements.