// API 测试脚本
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// 测试健康检查
async function testHealth() {
  console.log('测试健康检查...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✓ 健康检查通过:', response.data);
    return true;
  } catch (error) {
    console.error('✗ 健康检查失败:', error.message);
    return false;
  }
}

// 测试创建学生
async function testCreateStudent() {
  console.log('\n测试创建学生...');
  try {
    const response = await axios.post(`${BASE_URL}/students`, {
      name: '张三',
      phone: '13800138000',
      notes: '擅长民族唱法'
    });
    console.log('✓ 创建学生成功:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('✗ 创建学生失败:', error.response?.data || error.message);
    return null;
  }
}

// 测试获取学生列表
async function testGetStudents() {
  console.log('\n测试获取学生列表...');
  try {
    const response = await axios.get(`${BASE_URL}/students`);
    console.log('✓ 获取学生列表成功，共', response.data.data.total, '个学生');
    return true;
  } catch (error) {
    console.error('✗ 获取学生列表失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试获取系统设置
async function testGetSettings() {
  console.log('\n测试获取系统设置...');
  try {
    const response = await axios.get(`${BASE_URL}/settings`);
    console.log('✓ 获取系统设置成功:', response.data);
    return true;
  } catch (error) {
    console.error('✗ 获取系统设置失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试首页统计
async function testDashboard() {
  console.log('\n测试首页统计...');
  try {
    const response = await axios.get(`${BASE_URL}/statistics/dashboard`);
    console.log('✓ 获取首页统计成功:', response.data);
    return true;
  } catch (error) {
    console.error('✗ 获取首页统计失败:', error.response?.data || error.message);
    return false;
  }
}

// 运行所有测试
async function runTests() {
  console.log('========================================');
  console.log('开始 API 测试');
  console.log('========================================');

  // 等待服务器启动
  console.log('\n等待服务器启动...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('\n服务器未启动，请先启动服务器');
    process.exit(1);
  }

  await testGetSettings();
  await testGetStudents();
  const student = await testCreateStudent();
  await testGetStudents();
  await testDashboard();

  console.log('\n========================================');
  console.log('测试完成');
  console.log('========================================');
}

runTests();

