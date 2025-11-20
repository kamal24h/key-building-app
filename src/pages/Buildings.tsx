import React, { useEffect, useState } from 'react';

interface house {
  buildingId: number;
  name: string;
  address: string;
  totalUnits: number;
  managerId?: string;  
  // status: 'active' | 'inactive' | 'under_construction';
  createdAt: string;
}

function BuildingTable() {
  const [houses, setHouses] = useState<house[]>([]);
  const [loading, setLoading] = useState(true);


  // Fetch data from an API when component mounts
  useEffect(() => {
    fetch('https://localhost:7207/api/building/all') // example API
      .then(response => response.json())
      .then(data => {        
        setHouses(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('خطا در دسترسی به سرویسهای برنامه:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Building List</h2>
      <table cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th>Building ID</th>
            <th>Name</th>
            <th>Address</th>
            <th>Manager ID</th>
          </tr>
        </thead>
        <tbody>
          {houses.map( item => (
            <tr key={item.buildingId}>
              <td>{item.buildingId}</td>
              <td>{item.name}</td>
              <td>{item.address}</td>
              <td>{item.managerId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BuildingTable;
