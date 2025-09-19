// GraphQL Schema Validation Examples
import { string, number, object, array, union, literal, graphqlSchema } from 'fast-schema';

console.log('=== GraphQL Schema Validation Examples ===\n');

// 1. GraphQL Scalar Types validation
const graphqlScalarSchema = object({
  String: string(),
  Int: number().int(),
  Float: number(),
  Boolean: string().refine(val => val === 'true' || val === 'false').transform(val => val === 'true'),
  ID: string()
});

console.log('1. GraphQL scalar types validation:');
const scalarData = {
  String: 'Hello World',
  Int: 42,
  Float: 3.14,
  Boolean: 'true',
  ID: 'user_123'
};

try {
  console.log('✅ Valid GraphQL scalars:', graphqlScalarSchema.parse(scalarData));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 2. GraphQL Object Type validation
const userTypeSchema = object({
  __typename: literal('User'),
  id: string(),
  name: string(),
  email: string().email(),
  age: number().int().min(0).optional(),
  posts: array(object({
    __typename: literal('Post'),
    id: string(),
    title: string(),
    content: string(),
    publishedAt: string().datetime().optional()
  })).optional()
});

console.log('\n2. GraphQL Object Type validation:');
const userData = {
  __typename: 'User',
  id: 'user_456',
  name: 'Jane Doe',
  email: 'jane@example.com',
  age: 28,
  posts: [
    {
      __typename: 'Post',
      id: 'post_789',
      title: 'GraphQL Best Practices',
      content: 'Here are some tips...',
      publishedAt: '2024-03-15T10:00:00Z'
    }
  ]
};

try {
  console.log('✅ Valid GraphQL User object:', userTypeSchema.parse(userData));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 3. GraphQL Union Type validation
const searchResultSchema = union([
  object({
    __typename: literal('User'),
    id: string(),
    name: string(),
    email: string().email()
  }),
  object({
    __typename: literal('Post'),
    id: string(),
    title: string(),
    author: object({
      id: string(),
      name: string()
    })
  }),
  object({
    __typename: literal('Comment'),
    id: string(),
    content: string(),
    author: object({
      id: string(),
      name: string()
    })
  })
]);

console.log('\n3. GraphQL Union Type validation:');
const searchResults = [
  {
    __typename: 'User',
    id: 'user_123',
    name: 'John Doe',
    email: 'john@example.com'
  },
  {
    __typename: 'Post',
    id: 'post_456',
    title: 'Learning GraphQL',
    author: { id: 'user_789', name: 'Alice' }
  },
  {
    __typename: 'Comment',
    id: 'comment_101',
    content: 'Great post!',
    author: { id: 'user_202', name: 'Bob' }
  }
];

try {
  for (const result of searchResults) {
    console.log('✅ Valid search result:', searchResultSchema.parse(result));
  }
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 4. GraphQL Input Type validation
const createPostInputSchema = object({
  title: string().min(1).max(200),
  content: string().min(1),
  tags: array(string().min(1)).max(10).optional(),
  publishAt: string().datetime().optional(),
  authorId: string()
});

console.log('\n4. GraphQL Input Type validation:');
const createPostInput = {
  title: 'New GraphQL Tutorial',
  content: 'This is a comprehensive guide to GraphQL...',
  tags: ['graphql', 'tutorial', 'api'],
  publishAt: '2024-03-20T15:00:00Z',
  authorId: 'user_123'
};

try {
  console.log('✅ Valid create post input:', createPostInputSchema.parse(createPostInput));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 5. GraphQL Query Response validation
const queryResponseSchema = object({
  data: object({
    user: object({
      id: string(),
      name: string(),
      posts: object({
        edges: array(object({
          node: object({
            id: string(),
            title: string(),
            publishedAt: string().datetime().optional()
          }),
          cursor: string()
        })),
        pageInfo: object({
          hasNextPage: string().transform(val => val === 'true'),
          hasPreviousPage: string().transform(val => val === 'true'),
          startCursor: string().optional(),
          endCursor: string().optional()
        })
      })
    }).optional()
  }).optional(),
  errors: array(object({
    message: string(),
    locations: array(object({
      line: number().int(),
      column: number().int()
    })).optional(),
    path: array(union([string(), number()])).optional(),
    extensions: object({}).optional()
  })).optional(),
  extensions: object({}).optional()
});

console.log('\n5. GraphQL Query Response validation:');
const queryResponse = {
  data: {
    user: {
      id: 'user_123',
      name: 'John Doe',
      posts: {
        edges: [
          {
            node: {
              id: 'post_456',
              title: 'GraphQL Fundamentals',
              publishedAt: '2024-03-15T10:00:00Z'
            },
            cursor: 'cursor_abc123'
          },
          {
            node: {
              id: 'post_789',
              title: 'Advanced GraphQL',
              publishedAt: '2024-03-16T14:30:00Z'
            },
            cursor: 'cursor_def456'
          }
        ],
        pageInfo: {
          hasNextPage: 'false',
          hasPreviousPage: 'false',
          startCursor: 'cursor_abc123',
          endCursor: 'cursor_def456'
        }
      }
    }
  }
};

try {
  console.log('✅ Valid GraphQL query response:', queryResponseSchema.parse(queryResponse));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 6. GraphQL Error Response validation
const errorResponse = {
  errors: [
    {
      message: 'Field "invalidField" doesn\'t exist on type "User"',
      locations: [{ line: 3, column: 5 }],
      path: ['user', 'invalidField'],
      extensions: {
        code: 'GRAPHQL_VALIDATION_FAILED'
      }
    }
  ]
};

console.log('\n6. GraphQL Error Response validation:');
try {
  console.log('✅ Valid GraphQL error response:', queryResponseSchema.parse(errorResponse));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 7. GraphQL Mutation Response validation
const mutationResponseSchema = object({
  data: object({
    createPost: object({
      success: string().transform(val => val === 'true'),
      post: object({
        id: string(),
        title: string(),
        content: string(),
        author: object({
          id: string(),
          name: string()
        }),
        createdAt: string().datetime()
      }).optional(),
      errors: array(object({
        field: string(),
        message: string()
      })).optional()
    })
  }).optional(),
  errors: array(object({
    message: string(),
    path: array(union([string(), number()])).optional()
  })).optional()
});

console.log('\n7. GraphQL Mutation Response validation:');
const mutationResponse = {
  data: {
    createPost: {
      success: 'true',
      post: {
        id: 'post_new123',
        title: 'New GraphQL Tutorial',
        content: 'This is a comprehensive guide...',
        author: {
          id: 'user_123',
          name: 'John Doe'
        },
        createdAt: '2024-03-20T15:00:00Z'
      }
    }
  }
};

try {
  console.log('✅ Valid GraphQL mutation response:', mutationResponseSchema.parse(mutationResponse));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 8. GraphQL Subscription validation
const subscriptionEventSchema = object({
  data: object({
    messageAdded: object({
      id: string(),
      content: string(),
      author: object({
        id: string(),
        name: string()
      }),
      createdAt: string().datetime(),
      chatRoom: object({
        id: string(),
        name: string()
      })
    })
  })
});

console.log('\n8. GraphQL Subscription validation:');
const subscriptionEvent = {
  data: {
    messageAdded: {
      id: 'msg_456',
      content: 'Hello everyone!',
      author: {
        id: 'user_789',
        name: 'Alice'
      },
      createdAt: '2024-03-20T16:30:00Z',
      chatRoom: {
        id: 'room_general',
        name: 'General Discussion'
      }
    }
  }
};

try {
  console.log('✅ Valid GraphQL subscription event:', subscriptionEventSchema.parse(subscriptionEvent));
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 9. GraphQL Schema Definition validation
const schemaDefinitionExample = {
  query: 'Query',
  mutation: 'Mutation',
  subscription: 'Subscription',
  types: {
    Query: {
      kind: 'OBJECT',
      name: 'Query',
      fields: {
        user: {
          name: 'user',
          type_name: 'User',
          args: {
            id: {
              name: 'id',
              type_name: 'ID!',
              description: 'User ID'
            }
          }
        }
      }
    },
    User: {
      kind: 'OBJECT',
      name: 'User',
      fields: {
        id: { name: 'id', type_name: 'ID!' },
        name: { name: 'name', type_name: 'String!' },
        email: { name: 'email', type_name: 'String!' }
      }
    }
  },
  directives: []
};

console.log('\n9. GraphQL Schema Definition:');
try {
  const schemaValidator = graphqlSchema(schemaDefinitionExample);
  console.log('✅ GraphQL schema definition created successfully');
} catch (error) {
  console.log('❌ Error:', error.message);
}

console.log('\n=== GraphQL Schema Validation Examples Complete ===');