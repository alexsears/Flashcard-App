import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

function LearningProgressGraph() {
  const { userId } = useParams();
  const [data, setData] = useState([]);

  useEffect(() => {
    console.log(`Fetching learning progress data for user ${userId}`);
    fetch(`/api/learningprogress/${userId}`)
      .then(response => {
        console.log('Received response:', response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Received data:', data);
        setData(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [userId]);

  const graphData = data.map(progress => ({
    date: new Date(progress.nextReviewDate._seconds * 1000).toLocaleDateString(),
    interval: progress.interval,
    reviewCount: progress.reviewCount,
    easeFactor: progress.easeFactor
  }));

  console.log('Graph data:', graphData);

  return (
    <LineChart width={500} height={300} data={graphData}>
      <Line type="monotone" dataKey="interval" stroke="#8884d8" />
      <Line type="monotone" dataKey="reviewCount" stroke="#82ca9d" />
      <Line type="monotone" dataKey="easeFactor" stroke="#ffc658" />
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
    </LineChart>
  );
}

export default LearningProgressGraph;
