import React from 'react';
import Chat from './Chat';
import Layout from '../../components/layout/Layout';

function AssistantPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Layout>
      <div className="assistant-page">
        <Chat currentUser={user} />
      </div>
    </Layout>
  );
}

export default AssistantPage;
