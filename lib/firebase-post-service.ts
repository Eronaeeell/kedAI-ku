import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, where } from 'firebase/firestore';

export interface PostData {
  id?: string; // Firestore document ID
  platform: 'linkedin' | 'x';
  caption: string | null;
  image: string | null;
  postId: string; // Original platform post ID (Twitter ID or LinkedIn URN)
  dateTime: Date;
  createdAt: Date;
}

export class FirebasePostService {
  private static readonly COLLECTION_NAME = 'posts';

  /**
   * Save a successful post to Firebase
   */
  static async savePost(postData: Omit<PostData, 'id' | 'createdAt'>): Promise<string | null> {
    try {
      console.log('🔥 Saving post to Firebase:', postData);
      
      const docData = {
        ...postData,
        createdAt: new Date(),
        // Convert Date to Firestore Timestamp for better querying
        dateTime: postData.dateTime,
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), docData);
      
      console.log('✅ Post saved to Firebase with ID:', docRef.id);
      return docRef.id;
      
    } catch (error) {
      console.error('❌ Error saving post to Firebase:', error);
      return null;
    }
  }

  /**
   * Get all posts, optionally filtered by platform
   */
  static async getPosts(platform?: 'linkedin' | 'x', limitCount: number = 50): Promise<PostData[]> {
    try {
      console.log(`🔥 Fetching posts from Firebase${platform ? ` for platform: ${platform}` : ''}`);
      
      let q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('dateTime', 'desc'),
        limit(limitCount)
      );

      // Always use simple query and filter client-side to avoid Firestore index issues
      if (platform) {
        console.log(`🎯 Applying platform filter: ${platform} (client-side filtering)`);
        // Use basic query and filter client-side to avoid compound index requirement
        q = query(
          collection(db, this.COLLECTION_NAME),
          orderBy('dateTime', 'desc'),
          limit(limitCount * 3) // Get more to account for filtering
        );
      }

      const querySnapshot = await getDocs(q);
      const posts: PostData[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`📄 Processing document ${doc.id}: platform="${data.platform}"`);
        
        // If we have a platform filter, apply client-side filtering as well
        if (!platform || data.platform === platform) {
          posts.push({
            id: doc.id,
            platform: data.platform,
            caption: data.caption,
            image: data.image,
            postId: data.postId,
            dateTime: data.dateTime.toDate(), // Convert Firestore Timestamp to Date
            createdAt: data.createdAt.toDate(),
          });
        }
      });
      
      // Limit results after client-side filtering
      const finalPosts = posts.slice(0, limitCount);

      console.log(`✅ Retrieved ${finalPosts.length} posts from Firebase (filtered from ${querySnapshot.size} total)`);
      console.log(`📊 Platform breakdown:`, finalPosts.reduce((acc, post) => {
        acc[post.platform] = (acc[post.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));
      
      return finalPosts;
      
    } catch (error) {
      console.error('❌ Error fetching posts from Firebase:', error);
      return [];
    }
  }

  /**
   * Get posts count by platform
   */
  static async getPostsCount(platform?: 'linkedin' | 'x'): Promise<number> {
    try {
      let q = collection(db, this.COLLECTION_NAME);
      
      if (platform) {
        q = query(collection(db, this.COLLECTION_NAME), where('platform', '==', platform)) as any;
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
      
    } catch (error) {
      console.error('❌ Error getting posts count from Firebase:', error);
      return 0;
    }
  }

  /**
   * Check if a post already exists (to prevent duplicates)
   */
  static async postExists(postId: string, platform: 'linkedin' | 'x'): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('postId', '==', postId),
        where('platform', '==', platform),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
      
    } catch (error) {
      console.error('❌ Error checking post existence in Firebase:', error);
      return false;
    }
  }
}