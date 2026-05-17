// MongoDB 数据库初始化脚本
// 数据库名称: vocal-class

// 连接到数据库
db = db.getSiblingDB('vocal-class');

print('开始初始化数据库: vocal-class');

// ========================================
// 1. 清空现有数据（如果需要重新初始化）
// ========================================
// 注释掉以下代码以保留现有数据
// db.students.drop();
// db.course_packages.drop();
// db.courses.drop();
// db.income_records.drop();
// db.settings.drop();

// ========================================
// 2. 创建集合索引
// ========================================

print('创建 students 集合索引...');
db.students.createIndex({ phone: 1 }, { unique: true, name: 'idx_phone_unique' });
db.students.createIndex({ name: 1 }, { name: 'idx_name' });
db.students.createIndex({ remainingHours: 1 }, { name: 'idx_remaining_hours' });
db.students.createIndex({ isDeleted: 1 }, { name: 'idx_is_deleted' });

print('创建 course_packages 集合索引...');
db.course_packages.createIndex(
  { studentId: 1, purchaseDate: -1 },
  { name: 'idx_student_purchase_date' }
);

print('创建 courses 集合索引...');
db.courses.createIndex(
  { studentId: 1, date: 1, startTime: 1 },
  { name: 'idx_student_date_time' }
);
db.courses.createIndex(
  { date: 1, startTime: 1, status: 1 },
  { name: 'idx_date_time_status' }
);
db.courses.createIndex({ status: 1 }, { name: 'idx_status' });
db.courses.createIndex({ createdAt: -1 }, { name: 'idx_created_at' });

print('创建 income_records 集合索引...');
db.income_records.createIndex(
  { studentId: 1, date: -1 },
  { name: 'idx_student_date' }
);
db.income_records.createIndex({ date: -1 }, { name: 'idx_date' });
db.income_records.createIndex({ type: 1 }, { name: 'idx_type' });

// ========================================
// 3. 初始化系统设置
// ========================================

print('初始化系统设置...');

// 检查 settings 是否已存在
const existingSettings = db.settings.findOne({ _id: ObjectId("000000000000000000000001") });

if (!existingSettings) {
  db.settings.insertOne({
    _id: ObjectId("000000000000000000000001"),
    defaultCourseDuration: 1,
    defaultHourlyRate: 200,
    defaultLocation: "音乐工作室",
    warningThreshold: 3,
    teacherName: "",
    teacherPhone: "",
    wechatOpenId: "",
    updatedAt: new Date()
  });
  print('✓ 系统设置已创建');
} else {
  print('✓ 系统设置已存在，跳过');
}

// ========================================
// 4. 创建验证规则（可选）
// ========================================

print('创建数据验证规则...');

// students 集合验证
db.runCommand({
  collMod: "students",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "phone", "remainingHours", "isDeleted", "createdAt", "updatedAt"],
      properties: {
        name: {
          bsonType: "string",
          minLength: 2,
          maxLength: 10,
          description: "学生姓名必须为2-10个字符"
        },
        phone: {
          bsonType: "string",
          pattern: "^1[3-9]\\d{9}$",
          description: "必须是11位有效手机号码"
        },
        remainingHours: {
          bsonType: "number",
          minimum: 0,
          description: "剩余课时不能为负数"
        },
        notes: {
          bsonType: "string",
          maxLength: 200,
          description: "备注不能超过200字"
        },
        isDeleted: {
          bsonType: "bool",
          description: "软删除标记"
        },
        createdAt: {
          bsonType: "date"
        },
        updatedAt: {
          bsonType: "date"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// course_packages 集合验证
db.runCommand({
  collMod: "course_packages",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["studentId", "hours", "amount", "purchaseDate", "createdAt"],
      properties: {
        studentId: {
          bsonType: "objectId"
        },
        hours: {
          bsonType: "number",
          minimum: 1,
          description: "课时数必须为正整数"
        },
        amount: {
          bsonType: "number",
          minimum: 0,
          description: "金额必须为正数"
        },
        purchaseDate: {
          bsonType: "date"
        },
        note: {
          bsonType: "string"
        },
        createdAt: {
          bsonType: "date"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// courses 集合验证
db.runCommand({
  collMod: "courses",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["studentId", "date", "startTime", "endTime", "duration", "status", "attendanceStatus", "createdAt", "updatedAt"],
      properties: {
        studentId: {
          bsonType: "objectId"
        },
        date: {
          bsonType: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "日期格式必须为 YYYY-MM-DD"
        },
        startTime: {
          bsonType: "string",
          pattern: "^\\d{2}:\\d{2}$",
          description: "时间格式必须为 HH:mm"
        },
        endTime: {
          bsonType: "string",
          pattern: "^\\d{2}:\\d{2}$",
          description: "时间格式必须为 HH:mm"
        },
        duration: {
          bsonType: "number",
          minimum: 0.5,
          description: "课时长度必须大于0"
        },
        status: {
          enum: ["pending", "completed", "cancelled"],
          description: "状态必须为: pending, completed, cancelled"
        },
        attendanceStatus: {
          enum: ["none", "present", "absent", "leave"],
          description: "签到状态必须为: none, present, absent, leave"
        },
        location: {
          bsonType: "string"
        },
        notes: {
          bsonType: "string"
        },
        createdAt: {
          bsonType: "date"
        },
        updatedAt: {
          bsonType: "date"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// income_records 集合验证
db.runCommand({
  collMod: "income_records",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["studentId", "amount", "type", "date", "createdAt"],
      properties: {
        studentId: {
          bsonType: "objectId"
        },
        amount: {
          bsonType: "number",
          minimum: 0,
          description: "金额必须为正数"
        },
        type: {
          enum: ["course_package", "other"],
          description: "类型必须为: course_package, other"
        },
        date: {
          bsonType: "date"
        },
        note: {
          bsonType: "string"
        },
        relatedId: {
          bsonType: ["objectId", "null"]
        },
        createdAt: {
          bsonType: "date"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// ========================================
// 5. 显示初始化结果
// ========================================

print('\n========================================');
print('数据库初始化完成！');
print('========================================');
print('数据库名称: vocal-class');
print('');
print('集合列表:');
db.getCollectionNames().forEach(function(collection) {
  const count = db[collection].countDocuments();
  const indexes = db[collection].getIndexes().length;
  print(`  - ${collection}: ${count} 个文档, ${indexes} 个索引`);
});
print('========================================\n');

// 显示系统设置
print('系统设置:');
printjson(db.settings.findOne());

