export const mockStudents = [
  {
    id: 's001',
    name: '王小明',
    phone: '13800138001',
    remainingHours: 10,
    notes: '音域较宽，适合练习高音部分',
    isDeleted: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-15T08:30:00.000Z'
  },
  {
    id: 's002',
    name: '李梅',
    phone: '13800138002',
    remainingHours: 5,
    notes: '声音甜美，需加强气息练习',
    isDeleted: false,
    createdAt: '2025-01-05T00:00:00.000Z',
    updatedAt: '2025-01-20T09:00:00.000Z'
  },
  {
    id: 's003',
    name: '张华',
    phone: '13800138003',
    remainingHours: 2,
    notes: '进步明显，继续保持',
    isDeleted: false,
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: '2025-01-22T14:20:00.000Z'
  },
  {
    id: 's004',
    name: '刘芳',
    phone: '13800138004',
    remainingHours: 15,
    notes: '基础扎实，可以挑战难度曲目',
    isDeleted: false,
    createdAt: '2025-01-12T00:00:00.000Z',
    updatedAt: '2025-01-23T10:15:00.000Z'
  },
  {
    id: 's005',
    name: '陈强',
    phone: '13800138005',
    remainingHours: 8,
    notes: '男中音，音色浑厚',
    isDeleted: false,
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2025-01-25T11:00:00.000Z'
  },
  {
    id: 's006',
    name: '赵敏',
    phone: '13800138006',
    remainingHours: 12,
    notes: '节奏感好，乐感强',
    isDeleted: false,
    createdAt: '2025-01-18T00:00:00.000Z',
    updatedAt: '2025-01-26T15:30:00.000Z'
  },
  {
    id: 's007',
    name: '孙丽',
    phone: '13800138007',
    remainingHours: 1,
    notes: '课时即将用完，提醒续费',
    isDeleted: false,
    createdAt: '2025-01-20T00:00:00.000Z',
    updatedAt: '2025-01-27T09:45:00.000Z'
  },
  {
    id: 's008',
    name: '周杰',
    phone: '13800138008',
    remainingHours: 20,
    notes: '新学员，刚购买课时包',
    isDeleted: false,
    createdAt: '2025-02-01T00:00:00.000Z',
    updatedAt: '2025-02-01T10:00:00.000Z'
  }
]

export const mockCoursePackages = [
  {
    id: 'cp001',
    studentId: 's001',
    hours: 10,
    amount: 2000,
    purchaseDate: '2025-01-01',
    note: '首次购买',
    createdAt: '2025-01-01T10:00:00.000Z'
  },
  {
    id: 'cp002',
    studentId: 's002',
    hours: 10,
    amount: 2000,
    purchaseDate: '2025-01-05',
    note: '续费',
    createdAt: '2025-01-05T11:00:00.000Z'
  },
  {
    id: 'cp003',
    studentId: 's003',
    hours: 5,
    amount: 1000,
    purchaseDate: '2025-01-10',
    note: '体验课包',
    createdAt: '2025-01-10T14:00:00.000Z'
  },
  {
    id: 'cp004',
    studentId: 's004',
    hours: 20,
    amount: 3800,
    purchaseDate: '2025-01-12',
    note: '大课包优惠',
    createdAt: '2025-01-12T10:15:00.000Z'
  },
  {
    id: 'cp005',
    studentId: 's005',
    hours: 10,
    amount: 2000,
    purchaseDate: '2025-01-15',
    note: '',
    createdAt: '2025-01-15T11:00:00.000Z'
  },
  {
    id: 'cp006',
    studentId: 's006',
    hours: 15,
    amount: 2900,
    purchaseDate: '2025-01-18',
    note: '',
    createdAt: '2025-01-18T15:30:00.000Z'
  },
  {
    id: 'cp007',
    studentId: 's007',
    hours: 5,
    amount: 1000,
    purchaseDate: '2025-01-20',
    note: '',
    createdAt: '2025-01-20T09:45:00.000Z'
  },
  {
    id: 'cp008',
    studentId: 's008',
    hours: 20,
    amount: 3800,
    purchaseDate: '2025-02-01',
    note: '新学员大课包',
    createdAt: '2025-02-01T10:00:00.000Z'
  }
]

