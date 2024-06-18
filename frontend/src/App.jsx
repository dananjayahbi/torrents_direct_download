import React, { useState } from "react";
import { Layout, Upload, Button, Input, message, Form } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const { Header, Content, Footer } = Layout;

const App = () => {
  const [file, setFile] = useState(null);
  const [magnetLink, setMagnetLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null); // State to store session ID

  const handleUpload = async () => {
    setLoading(true);

    try {
      if (file) {
        const formData = new FormData();
        formData.append("torrentFile", file);

        const response = await axios.post(
          "http://localhost:5000/api/torrents/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        message.success(
          "Torrent file uploaded and download started successfully!"
        );
        console.log(response.data);

        setSessionId(response.data.sessionId); // Store session ID received from backend
      } else if (magnetLink) {
        const response = await axios.post(
          "http://localhost:5000/api/torrents/download",
          { magnetLink }
        );

        message.success("Magnet link download started successfully!");
        console.log(response.data);

        setSessionId(response.data.sessionId); // Store session ID received from backend
      } else {
        message.error("Please provide either a torrent file or a magnet link");
      }
    } catch (error) {
      message.error("Failed to start download");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadZip = async () => {
    setLoading(true);
  
    try {
      fetch(`http://localhost:5000/api/torrents/zip`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
      .then((response) => response.blob())
      .then((blob) => {
        // Create a link element
        const link = document.createElement("a");
        // Create a URL for the blob and set it as the href attribute
        link.href = window.URL.createObjectURL(blob);
        // Set the download attribute to specify the filename
        link.download = "xyz.zip";
        // Append the link to the body
        document.body.appendChild(link);
        // Programmatically click the link to trigger the download
        link.click();
        // Remove the link from the document
        link.parentNode.removeChild(link);
      });

    } catch (error) {
      message.error('Failed to download zip file');
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
        <h1 style={{ color: "white" }}>Torrent Downloader</h1>
      </Header>
      <Content style={{ padding: "50px 50px" }}>
        <div className="site-layout-content" style={{ textAlign: "center" }}>
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
                <Button icon={<UploadOutlined />} disabled={loading}>
                  Select Torrent File
                </Button>
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
            {sessionId && (
              <Button
                type="primary"
                onClick={handleDownloadZip}
                loading={loading}
                style={{ marginTop: 16, marginLeft: 16 }}
              >
                {loading ? "Zipping..." : "Download Zip"}
              </Button>
            )}
          </Form>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>Torrent Downloader ©2024</Footer>
    </Layout>
  );
};

export default App;
