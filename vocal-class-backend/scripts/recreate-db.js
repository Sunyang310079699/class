// MongoDB 数据库重建脚本
// 数据库名称: vocal-class
// 连接命令: mongosh -u root -p 147258 --authenticationDatabase admin
// 
// 使用说明：
// 1. 此脚本会删除现有数据库并重新创建
// 2. 请确保已备份重要数据
// 3. 运行: node scripts/recreate-db.js

const { MongoClient, ObjectId } = require('mongodb');

// 数据库连接配置（使用authSource=admin）
const MONGODB_URI = 'mongodb://root:147258@39.106.63.161:27017/vocal-class?authSource=admin';
const DB_NAME = 'vocal-class';

async function recreateDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('正在连接 MongoDB...');
    await client.connect();
    console.log('✓ MongoDB 连接成功');

    const adminDb = client.db().admin();
    const db = client.db(DB_NAME);
    
    console.log(`\n开始重建数据库: ${DB_NAME}`);
    console.log('⚠️  警告：此操作将删除现有数据库！\n');

    // ========================================
    // 1. 删除现有数据库（如果存在）
    // ========================================
    const dbList = await adminDb.listDatabases();
    const dbExists = dbList.databases.some(d => d.name === DB_NAME);
    
    if (dbExists) {
      console.log('删除现有数据库...');
      await db.dropDatabase();
      console.log('✓ 现有数据库已删除');
    } else {
      console.log('✓ 数据库不存在，将创建新数据库');
    }

    // ========================================
    // 2. 创建集合索引
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
    await db.collection('courses').createIndex({ courseType: 1 }, { name: 'idx_course_type' });
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

    console.log('\n创建 users 集合索引...');
    await db.collection('users').createIndex({ account: 1 }, { unique: true, name: 'idx_account_unique' });
    await db.collection('users').createIndex({ role: 1 }, { name: 'idx_role' });
    await db.collection('users').createIndex({ studentId: 1 }, { name: 'idx_student_id' });
    await db.collection('users').createIndex({ phone: 1 }, { name: 'idx_phone' });
    console.log('✓ users 索引创建完成');

    // ========================================
    // 3. 初始化系统设置
    // ========================================

    console.log('\n初始化系统设置...');
    const settingsId = new ObjectId('000000000000000000000001');
    await db.collection('settings').insertOne({
      _id: settingsId,
      defaultCourseDuration: 1, // 1课时=45分钟
      defaultHourlyRate: 200, // 课时单价（元）
      defaultLocation: '音乐工作室',
      warningThreshold: 3, // 课时预警阈值
      teacherName: '',
      teacherPhone: '',
      wechatOpenId: '',
      updatedAt: new Date()
    });
    console.log('✓ 系统设置已创建');

    // ========================================
    // 4. 创建数据验证规则
    // ========================================

    console.log('\n创建数据验证规则...');

    // students 集合验证
    try {
      await db.createCollection('students', {
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
      await db.createCollection('course_packages', {
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
      await db.createCollection('courses', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['studentId', 'date', 'startTime', 'endTime', 'duration', 'status', 'attendanceStatus', 'courseType', 'createdAt', 'updatedAt'],
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
                description: '课时长度必须大于0（1课时=45分钟）'
              },
              location: {
                bsonType: 'string'
              },
              status: {
                enum: ['pending', 'completed', 'cancelled'],
                description: '状态必须为: pending, completed, cancelled'
              },
              attendanceStatus: {
                enum: ['none', 'present', 'absent', 'leave'],
                description: '签到状态必须为: none, present, absent, leave'
              },
              courseType: {
                enum: ['regular', 'temporary'],
                description: '课程类型必须为: regular（常规课程）, temporary（临时加课）'
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
      await db.createCollection('income_records', {
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
                enum: ['course', 'course_package', 'other'],
                description: '类型必须为: course（课程收入）, course_package（课时包收入）, other（其他收入）'
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

    // settings 集合验证
    try {
      await db.createCollection('settings', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['defaultCourseDuration', 'defaultHourlyRate', 'warningThreshold', 'updatedAt'],
            properties: {
              defaultCourseDuration: {
                bsonType: 'number',
                minimum: 0.5,
                description: '默认课时长度（1课时=45分钟）'
              },
              defaultHourlyRate: {
                bsonType: 'number',
                minimum: 0,
                description: '课时单价（元）'
              },
              defaultLocation: {
                bsonType: 'string'
              },
              warningThreshold: {
                bsonType: 'number',
                minimum: 0,
                description: '课时预警阈值'
              },
              teacherName: {
                bsonType: 'string'
              },
              teacherPhone: {
                bsonType: 'string'
              },
              wechatOpenId: {
                bsonType: 'string'
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
      console.log('✓ settings 验证规则已创建');
    } catch (error) {
      console.log(`⚠ settings 验证规则创建失败: ${error.message}`);
    }

    // users 集合验证
    try {
      await db.createCollection('users', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['account', 'password', 'role', 'phone', 'isActive', 'createdAt', 'updatedAt'],
            properties: {
              account: {
                bsonType: 'string',
                pattern: '^1[3-9]\\d{9}$',
                description: '账号必须是有效的11位手机号码'
              },
              password: {
                bsonType: 'string',
                description: '密码（已加密）'
              },
              role: {
                enum: ['teacher', 'student'],
                description: '角色必须为: teacher（老师）, student（学生）'
              },
              studentId: {
                bsonType: ['objectId', 'null'],
                description: '学生ID（仅学生账号有此字段）'
              },
              phone: {
                bsonType: 'string',
                pattern: '^1[3-9]\\d{9}$',
                description: '必须是有效的11位手机号码'
              },
              name: {
                bsonType: 'string',
                description: '姓名（仅学生账号有）'
              },
              isActive: {
                bsonType: 'bool',
                description: '账号是否激活'
              },
              loginAttempts: {
                bsonType: 'number',
                minimum: 0,
                description: '登录失败次数'
              },
              lockUntil: {
                bsonType: ['date', 'null'],
                description: '账号锁定截止时间'
              },
              lastLoginAt: {
                bsonType: ['date', 'null'],
                description: '最后登录时间'
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
      console.log('✓ users 验证规则已创建');
    } catch (error) {
      console.log(`⚠ users 验证规则创建失败: ${error.message}`);
    }

    // ========================================
    // 5. 显示初始化结果
    // ========================================

    console.log('\n========================================');
    console.log('数据库重建完成！');
    console.log('========================================');
    console.log(`数据库名称: ${DB_NAME}`);
    console.log(`数据库地址: 39.106.63.161:27017`);
    console.log(`连接命令: mongosh -u root -p 147258 --authenticationDatabase admin`);
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
    console.error('数据库重建失败:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await client.close();
    console.log('\n数据库连接已关闭');
  }
}

// 执行重建
recreateDatabase()
  .then(() => {
    console.log('\n✓ 数据库重建脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ 数据库重建脚本执行失败:', error);
    process.exit(1);
  });

