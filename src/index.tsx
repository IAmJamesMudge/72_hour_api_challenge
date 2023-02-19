import { ConfigProvider, ThemeConfig } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

const antTheme:ThemeConfig = {
  token: {
  }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <ConfigProvider theme={antTheme}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ConfigProvider>

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
