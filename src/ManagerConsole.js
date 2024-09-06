import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { firestore } from './firebaseConfig';  // Use firestore from config

function ManagerConsole() {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const onRowClick = (record) => {
    navigate(`/api/learningprogress/${record.uid}`);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);  // Start loading
      try {
        const usersCollection = collection(firestore, 'Users');
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('User data:', data);  // Check if data is being fetched
          return {
            ...data,
            uid: doc.id,
            email: data.email,
            dateCreated: data.dateCreated?.toDate().toLocaleString(),
            lastLogin: data.lastLogin?.toDate().toLocaleString(),
          };
        });
        setUserData(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);  // Stop loading
      }
    };

    fetchUsers();
  }, []);

  const userColumns = [
    { title: 'User', dataIndex: 'uid', key: 'uid', sorter: (a, b) => a.uid.localeCompare(b.uid) },
    { title: 'Email', dataIndex: 'email', key: 'email', sorter: (a, b) => a.email.localeCompare(b.email) },
    { title: 'Date Created', dataIndex: 'dateCreated', key: 'dateCreated', sorter: (a, b) => new Date(a.dateCreated) - new Date(b.dateCreated) },
    { title: 'Last Login', dataIndex: 'lastLogin', key: 'lastLogin', sorter: (a, b) => new Date(a.lastLogin) - new Date(b.lastLogin) },
    { title: 'Progress', dataIndex: 'progress', key: 'progress', sorter: (a, b) => a.progress - b.progress },
    { title: 'Score', dataIndex: 'score', key: 'score', sorter: (a, b) => a.score - b.score },
    { title: 'Role', dataIndex: 'role', key: 'role', sorter: (a, b) => a.role.localeCompare(b.role) },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Manager Console</h2>
      <Table 
        dataSource={userData} 
        columns={userColumns} 
        onRow={(record) => ({
          onClick: () => onRowClick(record),
        })} 
      />
    </div>
  );
}

export default ManagerConsole;
