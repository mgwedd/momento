export interface Memory {
    id: string
    title: string
    body: string
    isPublished: boolean
    userId: string, 
    story: string,
    createdAt: Date, 
    memoryOriginatedAt: Date, 
    reflectionId?: string, 
    editorId?: string, 
    imageUrl?: string, 
    archivedAt?: Date, 
    deletedAt?: Date
  }    


  export interface Db {
    memories: Memory[]
  }

  // MOCK DB
  export const db: Db = {
    memories: [{ 
        id: 'abc123', 
        title: 'Nexus Memory', 
        body: '...', 
        isPublished: false,
        userId: 'abc123',
        story: 'abc123',
        memoryOriginatedAt: new Date(), 
        createdAt: new Date()
     }],
  }