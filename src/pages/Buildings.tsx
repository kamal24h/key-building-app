import React, { useEffect, useState } from 'react';

interface house {
  buildingId: number;
  name: string;
  address: string;
  total_units: number;
  managerId?: string;
  manager_name?: string;
  status: 'active' | 'inactive' | 'under_construction';
  created_at: string;
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
        console.error('Error fetching data:', error);
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
            <th>BuildingId</th>
            <th>Name</th>
            <th>Address</th>
            <th>ManagerId</th>
          </tr>
        </thead>
        <tbody>
          {houses.map(house => (
            <tr key={house.buildingId}>
              <td>{house.buildingId}</td>
              <td>{house.name}</td>
              <td>{house.address}</td>
              <td>{house.managerId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BuildingTable;
