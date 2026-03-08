import { db } from '../src/config/firebase';
import { categoriesService } from '../src/services/categories.service';

async function resetCategories() {
    console.log('Fetching existing categories...');
    const snapshot = await db.collection('categories').get();

    console.log(`Found ${snapshot.size} categories. Deleting...`);
    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log('Categories deleted.');

    console.log('Seeding new categories...');
    await categoriesService.seedDefaultCategories();
    console.log('Done!');
}

resetCategories().catch(console.error);
