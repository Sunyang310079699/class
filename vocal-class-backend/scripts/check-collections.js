// 检查数据库集合和索引完整性脚本
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://root:147258@39.106.63.161:27017/vocal-class?authSource=admin';
const DB_NAME = 'vocal-class';

// 预期的集合和索引配置
const expectedCollections = {
  students: {
    indexes: [
      { key: { phone: 1 }, unique: true, name: 'idx_phone_unique' },
      { key: { name: 1 }, name: 'idx_name' },
      { key: { remainingHours: 1 }, name: 'idx_remaining_hours' },
      { key: { isDeleted: 1 }, name: 'idx_is_deleted' }
    ]
  },
  course_packages: {
    indexes: [
      { key: { studentId: 1, purchaseDate: -1 }, name: 'idx_student_purchase_date' }
    ]
  },
  courses: {
    indexes: [
      { key: { studentId: 1, date: 1, startTime: 1 }, name: 'idx_student_date_time' },
      { key: { date: 1, startTime: 1, status: 1 }, name: 'idx_date_time_status' },
      { key: { status: 1 }, name: 'idx_status' },
      { key: { courseType: 1 }, name: 'idx_course_type' },
      { key: { createdAt: -1 }, name: 'idx_created_at' }
    ]
  },
  income_records: {
    indexes: [
      { key: { studentId: 1, date: -1 }, name: 'idx_student_date' },
      { key: { date: -1 }, name: 'idx_date' },
      { key: { type: 1 }, name: 'idx_type' }
    ]
  },
  settings: {
    indexes: []
  },
  users: {
    indexes: [
      { key: { account: 1 }, unique: true, name: 'idx_account_unique' },
      { key: { role: 1 }, name: 'idx_role' },
      { key: { studentId: 1 }, name: 'idx_student_id' },
      { key: { phone: 1 }, name: 'idx_phone' }
    ]
  }
};

async function checkCollections() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✓ MongoDB 连接成功\n');

    const db = client.db(DB_NAME);
    const actualCollections = await db.listCollections().toArray();
    const actualCollectionNames = actualCollections.map(c => c.name);

    console.log('='.repeat(60));
    console.log('数据库集合和索引完整性检查');
    console.log('='.repeat(60));
    console.log(`数据库: ${DB_NAME}\n`);

    // 检查集合
    console.log('【集合检查】');
    const expectedCollectionNames = Object.keys(expectedCollections);
    const missingCollections = expectedCollectionNames.filter(name => !actualCollectionNames.includes(name));
    const extraCollections = actualCollectionNames.filter(name => !expectedCollectionNames.includes(name));

    if (missingCollections.length > 0) {
      console.log('❌ 缺失的集合:');
      missingCollections.forEach(name => console.log(`   - ${name}`));
    } else {
      console.log('✓ 所有预期集合都存在');
    }

    if (extraCollections.length > 0) {
      console.log('⚠️  额外的集合（不在预期中）:');
      extraCollections.forEach(name => console.log(`   - ${name}`));
    }

    console.log(`\n预期集合数: ${expectedCollectionNames.length}`);
    console.log(`实际集合数: ${actualCollectionNames.length}`);
    console.log(`\n集合列表: ${actualCollectionNames.join(', ')}\n`);

    // 检查索引
    console.log('【索引检查】');
    let allIndexesCorrect = true;

    for (const [collectionName, config] of Object.entries(expectedCollections)) {
      if (!actualCollectionNames.includes(collectionName)) {
        console.log(`\n⚠️  跳过 ${collectionName}（集合不存在）`);
        continue;
      }

      const collection = db.collection(collectionName);
      const actualIndexes = await collection.indexes();
      
      console.log(`\n${collectionName}:`);
      console.log(`  预期索引数: ${config.indexes.length + 1}`); // +1 for _id index
      console.log(`  实际索引数: ${actualIndexes.length}`);

      const actualIndexNames = actualIndexes.map(idx => idx.name).filter(name => name !== '_id_');
      const expectedIndexNames = config.indexes.map(idx => idx.name);

      const missingIndexes = expectedIndexNames.filter(name => !actualIndexNames.includes(name));
      const extraIndexes = actualIndexNames.filter(name => !expectedIndexNames.includes(name));

      if (missingIndexes.length > 0) {
        console.log(`  ❌ 缺失的索引: ${missingIndexes.join(', ')}`);
        allIndexesCorrect = false;
      }

      if (extraIndexes.length > 0) {
        console.log(`  ⚠️  额外的索引: ${extraIndexes.join(', ')}`);
      }

      if (missingIndexes.length === 0 && extraIndexes.length === 0) {
        console.log(`  ✓ 索引完整`);
      }

      // 检查索引配置
      for (const expectedIdx of config.indexes) {
        const actualIdx = actualIndexes.find(idx => idx.name === expectedIdx.name);
        if (actualIdx) {
          if (expectedIdx.unique && !actualIdx.unique) {
            console.log(`  ⚠️  索引 ${expectedIdx.name} 缺少 unique 约束`);
            allIndexesCorrect = false;
          }
        }
      }
    }

    // 总结
    console.log('\n' + '='.repeat(60));
    if (missingCollections.length === 0 && allIndexesCorrect) {
      console.log('✓ 所有集合和索引检查通过！');
    } else {
      console.log('❌ 发现问题，请检查上述输出');
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('检查失败:', error.message);
    throw error;
  } finally {
    await client.close();
  }
}

checkCollections()
  .then(() => {
    console.log('\n检查完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n检查失败:', error);
    process.exit(1);
  });

