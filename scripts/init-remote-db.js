// MongoDB 远程数据库初始化脚本
// 数据库名称: vocal-class
// 数据库地址: 39.106.63.161:27017

const { MongoClient, ObjectId } = require('mongodb');

// 数据库连接配置
const MONGODB_URI = 'mongodb://root:147258@39.106.63.161:27017';
const DB_NAME = 'vocal-class';

async function initDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('正在连接 MongoDB...');
    await client.connect();
    console.log('✓ MongoDB 连接成功');

    const db = client.db(DB_NAME);
    console.log(`\n开始初始化数据库: ${DB_NAME}`);

    // ========================================
    // 1. 创建集合索引
    // ========================================

    console.log('\n创建 students 集合索引...');
    await db.collection('students').createIndex({ phone: 1 }, { unique: true, name: 'idx_phone_unique' });
    await db.collection('students').createIndex({ name: 1 }, { name: 'idx_name' });
    await db.collection('students').createIndex({ remainingHours: 1 }, { name: 'idx_remaining_hours' });
    await db.collection('students').createIndex({ isDeleted: 1 }, { name: 'idx_is_deleted' });
    console.log('✓ students 索引创建完成');

    console.log('\n创建 course_packages 集合索引...');
    await db.collection('course_packages').createIndex(
      { studentId: 1, purchaseDate: -1 },
      { name: 'idx_student_purchase_date' }
    );
    console.log('✓ course_packages 索引创建完成');

    console.log('\n创建 courses 集合索引...');
    await db.collection('courses').createIndex(
      { studentId: 1, date: 1, startTime: 1 },
      { name: 'idx_student_date_time' }
    );
    await db.collection('courses').createIndex(
      { date: 1, startTime: 1, status: 1 },
      { name: 'idx_date_time_status' }
    );
    await db.collection('courses').createIndex({ status: 1 }, { name: 'idx_status' });
    await db.collection('courses').createIndex({ createdAt: -1 }, { name: 'idx_created_at' });
    console.log('✓ courses 索引创建完成');

    console.log('\n创建 income_records 集合索引...');
    await db.collection('income_records').createIndex(
      { studentId: 1, date: -1 },
      { name: 'idx_student_date' }
    );
    await db.collection('income_records').createIndex({ date: -1 }, { name: 'idx_date' });
    await db.collection('income_records').createIndex({ type: 1 }, { name: 'idx_type' });
    console.log('✓ income_records 索引创建完成');

    // ========================================
    // 2. 初始化系统设置
    // ========================================

    console.log('\n初始化系统设置...');
    const settingsId = new ObjectId('000000000000000000000001');
    const existingSettings = await db.collection('settings').findOne({ _id: settingsId });

    if (!existingSettings) {
      await db.collection('settings').insertOne({
        _id: settingsId,
        defaultCourseDuration: 1,
        defaultHourlyRate: 200,
        defaultLocation: '音乐工作室',
        warningThreshold: 3,
        teacherName: '',
        teacherPhone: '',
        wechatOpenId: '',
        updatedAt: new Date()
      });
      console.log('✓ 系统设置已创建');
    } else {
      console.log('✓ 系统设置已存在，跳过');
    }

    // ========================================
    // 3. 创建数据验证规则（可选）
    // ========================================

    console.log('\n创建数据验证规则...');

    // students 集合验证
    try {
      await db.command({
        collMod: 'students',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'phone', 'remainingHours', 'isDeleted', 'createdAt', 'updatedAt'],
            properties: {
              name: {
                bsonType: 'string',
                minLength: 2,
                maxLength: 10,
                description: '学生姓名必须为2-10个字符'
              },
              phone: {
                bsonType: 'string',
                pattern: '^1[3-9]\\d{9}$',
                description: '必须是11位有效手机号码'
              },
              remainingHours: {
                bsonType: 'number',
                minimum: 0,
                description: '剩余课时不能为负数'
              },
              notes: {
                bsonType: 'string',
                maxLength: 200,
                description: '备注不能超过200字'
              },
              isDeleted: {
                bsonType: 'bool',
                description: '软删除标记'
              },
              createdAt: {
                bsonType: 'date'
              },
              updatedAt: {
                bsonType: 'date'
              }
            }
          }
        },
        validationLevel: 'moderate',
        validationAction: 'warn'
      });
      console.log('✓ students 验证规则已创建');
    } catch (error) {
      console.log(`⚠ students 验证规则创建失败: ${error.message}`);
    }

    // course_packages 集合验证
    try {
      await db.command({
        collMod: 'course_packages',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['studentId', 'hours', 'amount', 'purchaseDate', 'createdAt'],
            properties: {
              studentId: {
                bsonType: 'objectId'
              },
              hours: {
                bsonType: 'number',
                minimum: 1,
                description: '课时数必须为正整数'
              },
              amount: {
                bsonType: 'number',
                minimum: 0,
                description: '金额必须为正数'
              },
              purchaseDate: {
                bsonType: 'date'
              },
              note: {
                bsonType: 'string'
              },
              createdAt: {
                bsonType: 'date'
              }
            }
          }
        },
        validationLevel: 'moderate',
        validationAction: 'warn'
      });
      console.log('✓ course_packages 验证规则已创建');
    } catch (error) {
      console.log(`⚠ course_packages 验证规则创建失败: ${error.message}`);
    }

    // courses 集合验证
    try {
      await db.command({
        collMod: 'courses',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['studentId', 'date', 'startTime', 'endTime', 'duration', 'status', 'attendanceStatus', 'createdAt', 'updatedAt'],
            properties: {
              studentId: {
                bsonType: 'objectId'
              },
              date: {
                bsonType: 'string',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                description: '日期格式必须为 YYYY-MM-DD'
              },
              startTime: {
                bsonType: 'string',
                pattern: '^\\d{2}:\\d{2}$',
                description: '时间格式必须为 HH:mm'
              },
              endTime: {
                bsonType: 'string',
                pattern: '^\\d{2}:\\d{2}$',
                description: '时间格式必须为 HH:mm'
              },
              duration: {
                bsonType: 'number',
                minimum: 0.5,
                description: '课时长度必须大于0'
              },
              status: {
                enum: ['pending', 'completed', 'cancelled'],
                description: '状态必须为: pending, completed, cancelled'
              },
              attendanceStatus: {
                enum: ['none', 'present', 'absent', 'leave'],
                description: '签到状态必须为: none, present, absent, leave'
              },
              location: {
                bsonType: 'string'
              },
              notes: {
                bsonType: 'string'
              },
              createdAt: {
                bsonType: 'date'
              },
              updatedAt: {
                bsonType: 'date'
              }
            }
          }
        },
        validationLevel: 'moderate',
        validationAction: 'warn'
      });
      console.log('✓ courses 验证规则已创建');
    } catch (error) {
      console.log(`⚠ courses 验证规则创建失败: ${error.message}`);
    }

    // income_records 集合验证
    try {
      await db.command({
        collMod: 'income_records',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['studentId', 'amount', 'type', 'date', 'createdAt'],
            properties: {
              studentId: {
                bsonType: 'objectId'
              },
              amount: {
                bsonType: 'number',
                minimum: 0,
                description: '金额必须为正数'
              },
              type: {
                enum: ['course_package', 'other'],
                description: '类型必须为: course_package, other'
              },
              date: {
                bsonType: 'date'
              },
              note: {
                bsonType: 'string'
              },
              relatedId: {
                bsonType: ['objectId', 'null']
              },
              createdAt: {
                bsonType: 'date'
              }
            }
          }
        },
        validationLevel: 'moderate',
        validationAction: 'warn'
      });
      console.log('✓ income_records 验证规则已创建');
    } catch (error) {
      console.log(`⚠ income_records 验证规则创建失败: ${error.message}`);
    }

    // ========================================
    // 4. 显示初始化结果
    // ========================================

    console.log('\n========================================');
    console.log('数据库初始化完成！');
    console.log('========================================');
    console.log(`数据库名称: ${DB_NAME}`);
    console.log(`数据库地址: 39.106.63.161:27017`);
    console.log('');

    const collections = await db.listCollections().toArray();
    console.log('集合列表:');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      const indexes = await db.collection(collection.name).indexes();
      console.log(`  - ${collection.name}: ${count} 个文档, ${indexes.length} 个索引`);
    }
    console.log('========================================\n');

    // 显示系统设置
    const settings = await db.collection('settings').findOne({ _id: settingsId });
    if (settings) {
      console.log('系统设置:');
      console.log(JSON.stringify(settings, null, 2));
    }

  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    throw error;
  } finally {
    await client.close();
    console.log('\n数据库连接已关闭');
  }
}

// 执行初始化
initDatabase()
  .then(() => {
    console.log('\n✓ 初始化脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ 初始化脚本执行失败:', error);
    process.exit(1);
  });

