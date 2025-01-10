# Line Bot with Notion Integration

這是一個使用 Azure Functions 建立的 Line Bot，並且整合了 Notion 資料庫。此專案允許使用者透過 Line Bot 將訊息新增到 Notion 資料庫中，並且定期檢查 Notion 資料庫的更新，將更新的內容推送到 Line Bot。

## 目錄

- [專案結構](#專案結構)
- [環境變數](#環境變數)
- [安裝與設定](#安裝與設定)
- [使用方法](#使用方法)
- [功能說明](#功能說明)

## 專案結構

```plaintext
linebot_with_notion/
│
├── index.ts
│   # 主要程式碼
├── package.json
│   # 專案依賴
├── tsconfig.json
│   # TypeScript 設定
└── README.md
    # 專案說明文件
```


## 環境變數

在使用此專案之前，請確保已設定以下環境變數：

- `CHANNEL_ACCESS_TOKEN`：Line Bot 的 Channel Access Token
- `CHANNEL_SECRET`：Line Bot 的 Channel Secret
- `USER_ID`：接收推送訊息的使用者 ID
- `DATABASE_ID_TALK`：Notion 資料庫 ID
- `API_KEY`：Notion API 金鑰

## 安裝與設定

1. Clone此專案到本地端：
git clone https://github.com/anonyi/Linebot_Notion.git
cd Linebot_Notion


2. 安裝專案依賴：

	npm install
    

3. 設定環境變數：

    在專案根目錄下建立 `.env` 檔案，並填入上述的環境變數。

4. 編譯 TypeScript：

   npm run build


5. 部署到 Azure Functions：

    請參考 [Azure Functions 官方文件](https://docs.microsoft.com/azure/azure-functions/functions-develop-vs-code) 進行部署。

## 使用方法

1. 使用者透過 Line Bot 發送訊息。
2. Line Bot 會將訊息新增到 Notion 資料庫中。
3. 定期檢查 Notion 資料庫的更新，並將更新的內容推送到 Line Bot。

## 功能說明

- **handleEvent**：處理來自 Line Bot 的事件，並將訊息新增到 Notion 資料庫中。
- **handleAddTalkLine**：將使用者的訊息新增到 Notion 資料庫中。
- **pushMsg**：推送訊息到指定的使用者。
- **addNotionPageToDatabase**：將頁面新增到 Notion 資料庫中。
- **updateIsFeedBack**：更新 Notion 資料庫中的 IsFeedBack 屬性。
- **queryByTalkLine**：查詢 Notion 資料庫中的 TalkLine 屬性。
- **processTalkLineResult**：處理查詢結果，並更新 IsFeedBack 屬性。

## 注意事項

- 請確保 Notion 資料庫的結構符合程式碼中的設定。
- 請定期檢查並更新環境變數，以確保系統正常運作。

---

此專案使用了 Azure Functions、Line Bot SDK 和 Notion API 進行開發。如有任何問題，請參考相關的官方文件。
  
