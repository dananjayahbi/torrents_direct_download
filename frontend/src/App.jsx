import React, { useState } from "react";
import { Layout, Upload, Button, Input, message, Form } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import "./App.css";
import bgImg from "./assets/background-img.png";

const { Content, Footer } = Layout;
const { Dragger } = Upload;

const App = () => {
  const [file, setFile] = useState(null);
  const [fileList, setFileList] = useState([]); // State to manage file list
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
      fetch(`http://localhost:5000/api/torrents/zip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      message.error("Failed to download zip file");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    setFile(file);
    setFileList([file]); // Update file list with selected file
    return false;
  };

  const handleRemove = () => {
    setFile(null);
    setFileList([]);
  };

  return (
    <Layout
      className="layout"
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImg})`,
        backgroundSize: "cover",
      }}
    >
      <Content style={{ padding: "50px 50px" }}>
        <div className="site-layout-content">
          <h1
            style={{ textAlign: "center", marginBottom: "30px", color: "#fff" }}
          >
            Torrent Direct Downloader
          </h1>
        </div>
        <div
          className="site-layout-content"
          style={{
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Form layout="vertical">
            <p
              style={{ textAlign: "left", marginBottom: "10px", color: "#fff" }}
            >
              Magnet Link
            </p>
            <div className="magnet-link-container" style={{backgroundColor: "transparent"}}>
              <Form.Item style={{ paddingTop: "20px" }}>
                <Input
                  placeholder="Enter Magnet Link"
                  value={magnetLink}
                  onChange={(e) => setMagnetLink(e.target.value)}
                  disabled={loading}
                  style={{ backgroundColor: "#fff", color: "#fff" }}
                />
              </Form.Item>
            </div>
            <p style={{ margin: "50px 0 20px 0", color: "#fff" }}>OR</p>
            <div style={{ width: "600px" }}>
              <p
                style={{
                  textAlign: "left",
                  color: "#fff",
                  marginBottom: "10px",
                }}
              >
                Upload Torrent File
              </p>
              <Form.Item>
                <Dragger
                  beforeUpload={beforeUpload}
                  fileList={fileList}
                  onRemove={handleRemove}
                  maxCount={1}
                  disabled={loading}
                  accept=".torrent"
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text" style={{ color: "#fff" }}>
                    Click or drag file to this area to upload
                  </p>
                  <p className="ant-upload-hint" style={{ color: "#fff" }}>
                    Support for a single .torrent file upload.
                  </p>
                </Dragger>
              </Form.Item>
            </div>
            {!sessionId && (
              <Button
                type="primary"
                onClick={handleUpload}
                loading={loading}
                style={{ marginTop: 16 }}
              >
                Start Download
              </Button>
            )}
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
      <Footer
        style={{
          textAlign: "center",
          backgroundColor: "transparent",
          color: "#fff",
        }}
      >
        Developed By Dananjaya ©2024
      </Footer>
    </Layout>
  );
};

export default App;
