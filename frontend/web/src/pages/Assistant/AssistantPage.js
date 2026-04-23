import React from 'react';
import Chat from './Chat';
import Layout from '../../components/layout/Layout';

function AssistantPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Layout>
      <Chat currentUser={user} />
    </Layout>
  );
}

export default AssistantPage;
