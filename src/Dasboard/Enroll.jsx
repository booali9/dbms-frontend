import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, message, Checkbox, Space } from 'antd';

const Enroll = () => {
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [selectedEnrollments, setSelectedEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [currentEnrollment, setCurrentEnrollment] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch pending enrollments
  useEffect(() => {
    const fetchPendingEnrollments = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/api/admin/getpendingenrollement', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setPendingEnrollments(response.data.enrollments);
      } catch (error) {
        message.error('Failed to fetch pending enrollments');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingEnrollments();
  }, []);

  // Approve single enrollment
  const handleApprove = async (enrollmentId) => {
    try {
      await axios.post('http://localhost:3000/api/admin/approveenrollement', 
        { enrollmentId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      message.success('Enrollment approved successfully');
      // Refresh the list
      setPendingEnrollments(pendingEnrollments.filter(e => e.enrollmentId !== enrollmentId));
    } catch (error) {
      message.error('Failed to approve enrollment');
      console.error('Error:', error);
    }
  };

  // Bulk approve enrollments
  const handleBulkApprove = async () => {
    if (selectedEnrollments.length === 0) {
      message.warning('Please select at least one enrollment');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/admin/bulkenrollementapprove', 
        { enrollmentIds: selectedEnrollments },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      message.success(`${selectedEnrollments.length} enrollments approved successfully`);
      // Refresh the list
      setPendingEnrollments(pendingEnrollments.filter(e => !selectedEnrollments.includes(e.enrollmentId)));
      setSelectedEnrollments([]);
    } catch (error) {
      message.error('Failed to approve enrollments');
      console.error('Error:', error);
    }
  };

  // Reject enrollment
  const handleReject = async () => {
    if (!rejectReason) {
      message.warning('Please provide a rejection reason');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/admin/rejectenrollement', 
        { 
          enrollmentId: currentEnrollment.enrollmentId,
          reason: rejectReason
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      message.success('Enrollment rejected successfully');
      setRejectModalVisible(false);
      setRejectReason('');
      // Refresh the list
      setPendingEnrollments(pendingEnrollments.filter(e => e.enrollmentId !== currentEnrollment.enrollmentId));
    } catch (error) {
      message.error('Failed to reject enrollment');
      console.error('Error:', error);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Select',
      dataIndex: 'enrollmentId',
      render: (id) => (
        <Checkbox
          checked={selectedEnrollments.includes(id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedEnrollments([...selectedEnrollments, id]);
            } else {
              setSelectedEnrollments(selectedEnrollments.filter(item => item !== id));
            }
          }}
        />
      ),
    },
    {
      title: 'Course',
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: 'Student',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
    },
    {
      title: 'Enrollment Date',
      dataIndex: 'enrollmentDate',
      key: 'enrollmentDate',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleApprove(record.enrollmentId)}>
            Approve
          </Button>
          <Button 
            danger 
            onClick={() => {
              setCurrentEnrollment(record);
              setRejectModalVisible(true);
            }}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  // Flatten the enrollment data for the table
  const tableData = pendingEnrollments.flatMap(courseGroup => 
    courseGroup.pendingStudents.map(student => ({
      key: student.enrollmentId,
      enrollmentId: student.enrollmentId,
      courseName: courseGroup.courseName,
      studentName: student.studentName,
      department: student.department,
      semester: student.semester,
      enrollmentDate: student.enrollmentDate,
    }))
  );

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Button 
          type="primary" 
          onClick={handleBulkApprove}
          disabled={selectedEnrollments.length === 0}
          style={{ marginRight: '8px' }}
        >
          Bulk Approve ({selectedEnrollments.length})
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tableData}
        loading={loading}
        rowSelection={{
          selectedRowKeys: selectedEnrollments,
          onChange: (selectedRowKeys) => {
            setSelectedEnrollments(selectedRowKeys);
          },
        }}
      />

      <Modal
        title="Reject Enrollment"
        visible={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
        }}
      >
        <p>Are you sure you want to reject this enrollment?</p>
        <p>Student: {currentEnrollment?.studentName}</p>
        <p>Course: {currentEnrollment?.courseName}</p>
        <textarea
          placeholder="Enter rejection reason"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          style={{ width: '100%', minHeight: '100px', marginTop: '10px' }}
        />
      </Modal>
    </div>
  );
};

export default Enroll;