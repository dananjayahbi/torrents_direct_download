import React, { useState } from 'react';
import { Layout, Upload, Button, Input, message, Form } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Header, Content, Footer } = Layout;

const App = () => {
  const [file, setFile] = useState(null);
  const [magnetLink, setMagnetLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    setLoading(true);

    try {
      if (file) {
        const formData = new FormData();
        formData.append('torrentFile', file);

        const response = await axios.post('http://localhost:5000/api/torrents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        message.success('Torrent file uploaded and download started successfully!');
        console.log(response.data);
      } else if (magnetLink) {
        const response = await axios.post('http://localhost:5000/api/torrents/download', { magnetLink });
        message.success('Magnet link download started successfully!');
        console.log(response.data);
      } else {
        message.error('Please provide either a torrent file or a magnet link');
      }
    } catch (error) {
      message.error('Failed to start download');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    setFile(file);
    return false;
  };

  return (
    <Layout className="layout">
      <Header>
        <div className="logo" />
        <h1 style={{ color: 'white' }}>Torrent Downloader</h1>
      </Header>
      <Content style={{ padding: '50px 50px' }}>
        <div className="site-layout-content" style={{ textAlign: 'center' }}>
          <Form layout="vertical">
            <Form.Item label="Magnet Link">
              <Input
                placeholder="Enter magnet link"
                value={magnetLink}
                onChange={(e) => setMagnetLink(e.target.value)}
                disabled={loading}
              />
            </Form.Item>
            <Form.Item label="Or Upload Torrent File">
              <Upload beforeUpload={beforeUpload} maxCount={1}>
                <Button icon={<UploadOutlined />} disabled={loading}>Select Torrent File</Button>
              </Upload>
            </Form.Item>
            <Button
              type="primary"
              onClick={handleUpload}
              loading={loading}
              style={{ marginTop: 16 }}
            >
              Start Download
            </Button>
          </Form>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Torrent Downloader ©2024</Footer>
    </Layout>
  );
};

export default App;
