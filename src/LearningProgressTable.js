import React, { useEffect, useState } from 'react';
import { Table, Spin, message } from 'antd';
import { useParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

function LearningProgressTable() {
  const { userId } = useParams();
  const [learningProgress, setLearningProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLearningProgress = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/learningprogress/${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const progressData = await response.json();

        const dataWithFlashcards = await Promise.all(progressData.map(async (progress) => {
          try {
            const flashcardResponse = await fetch(`${API_URL}/api/flashcard/${progress.flashcardId}`);
            if (!flashcardResponse.ok) {
              throw new Error(`HTTP error! status: ${flashcardResponse.status}`);
            }
            const flashcardData = await flashcardResponse.json();
            return {
              ...progress,
              flashcardFront: flashcardData.front,
              flashcardBack: flashcardData.back,
            };
          } catch (error) {
            console.error(`Error fetching flashcard ${progress.flashcardId}:`, error);
            return progress;
          }
        }));

        setLearningProgress(dataWithFlashcards);
      } catch (error) {
        console.error('Error fetching learning progress:', error);
        message.error('Failed to fetch learning progress');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningProgress();
  }, [userId]);

  const learningProgressColumns = [
    { title: 'Flashcard Front', dataIndex: 'flashcardFront', key: 'flashcardFront', sorter: (a, b) => a.flashcardFront.localeCompare(b.flashcardFront) },
    { title: 'Flashcard Back', dataIndex: 'flashcardBack', key: 'flashcardBack', sorter: (a, b) => a.flashcardBack.localeCompare(b.flashcardBack) },
    { title: 'Next Review Date', dataIndex: 'nextReviewDate', key: 'nextReviewDate', sorter: (a, b) => new Date(a.nextReviewDate._seconds * 1000) - new Date(b.nextReviewDate._seconds * 1000), render: (text, record) => new Date(record.nextReviewDate._seconds * 1000).toLocaleString() },
    { title: 'Interval', dataIndex: 'interval', key: 'interval', sorter: (a, b) => a.interval - b.interval },
    { title: 'Review Count', dataIndex: 'reviewCount', key: 'reviewCount', sorter: (a, b) => a.reviewCount - b.reviewCount },
    { title: 'Ease Factor', dataIndex: 'easeFactor', key: 'easeFactor', sorter: (a, b) => a.easeFactor - b.easeFactor },
  ];

  return (
    <div>
      <h2>User's Learning Progress</h2>
      <Spin spinning={isLoading}>
        <Table 
          dataSource={learningProgress} 
          columns={learningProgressColumns} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </div>
  );
}

export default LearningProgressTable;