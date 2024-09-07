import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

function LearningProgressGraph() {
  const { userId } = useParams();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/learningprogress/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setData(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error.message);
        setIsLoading(false);
      });
  }, [userId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const graphData = data.map(progress => ({
    date: new Date(progress.nextReviewDate._seconds * 1000).toLocaleDateString(),
    interval: progress.interval,
    reviewCount: progress.reviewCount,
    easeFactor: progress.easeFactor
  }));

  return (
    <LineChart width={600} height={400} data={graphData}>
      <Line type="monotone" dataKey="interval" stroke="#8884d8" name="Interval" />
      <Line type="monotone" dataKey="reviewCount" stroke="#82ca9d" name="Review Count" />
      <Line type="monotone" dataKey="easeFactor" stroke="#ffc658" name="Ease Factor" />
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
    </LineChart>
  );
}

export default LearningProgressGraph;