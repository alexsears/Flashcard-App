import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function LearningProgressStats() {
  const { userId } = useParams();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/learningprogressstats/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setStats(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching stats:', error);
        setError(error.message);
        setIsLoading(false);
      });
  }, [userId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return <div>No stats available</div>;

  return (
    <div>
      <h2>Learning Progress Stats</h2>
      <p>Total Cards Reviewed: {stats.totalReviews}</p>
      <p>Correct Reviews: {stats.correctReviews}</p>
      <p>Accuracy: {((stats.correctReviews / stats.totalReviews) * 100).toFixed(2)}%</p>
      <p>Average Interval: {stats.averageInterval.toFixed(2)} days</p>
      <p>Average Ease Factor: {stats.averageEaseFactor.toFixed(2)}</p>
    </div>
  );
}

export default LearningProgressStats;