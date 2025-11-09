// UserTable.tsx
import React, { useState, useEffect } from 'react';
import { House1 } from '../types/types';

const Buildings1: React.FC = () => {
  const [houses, setHouses] = useState<House1[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        //const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const response = await fetch('https://localhost:7207/api/building/all');
                
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: House1[] = await response.json();
        setHouses(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500 text-lg">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users Table</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 border-b text-left">ID</th>
              <th className="py-3 px-4 border-b text-left">Name</th>
              <th className="py-3 px-4 border-b text-left">Address</th>
              <th className="py-3 px-4 border-b text-left">ManagerId</th>
              {/* <th className="py-3 px-4 border-b text-left">Website</th>
              <th className="py-3 px-4 border-b text-left">Company</th> */}
            </tr>
          </thead>
          <tbody>
            {houses.map((item) => (
              <tr key={item.buildingId} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{item.buildingId}</td>
                <td className="py-2 px-4 border-b font-medium">{item.name}</td>
                {/* <td className="py-2 px-4 border-b text-blue-600">
                  <a href={`mailto:${item.email}`}>{item.email}</a>
                </td> */}
                <td className="py-2 px-4 border-b">{item.address}</td>
                {/* <td className="py-2 px-4 border-b text-blue-600">
                  <a 
                    href={`http://${user.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {item.website}
                  </a>
                </td> */}
                <td className="py-2 px-4 border-b">{item.managerId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        Showing {houses.length} users
      </div>
    </div>
  );
};

export default Buildings1;