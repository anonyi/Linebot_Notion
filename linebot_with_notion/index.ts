import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Client as LineClient, middleware, WebhookEvent, TextMessage, FlexMessage } from "@line/bot-sdk";
import { Client as NotionClient } from "@notionhq/client";
import { DatabaseObjectResponse, RichTextItemResponse, PartialUserObjectResponse, PageObjectResponse, QueryDatabaseResponse, PartialDatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";

/* Line setting */
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};

const client = new LineClient(config);



// 使用者 ID
const userId: string = process.env.USER_ID as string;


/* Line setting */


/* Notion setting */
const databaseIdTalk = process.env.DATABASE_ID_TALK;
const apiKey = process.env.API_KEY;

const notion = new NotionClient({ auth: apiKey })

type DateDatabasePropertyConfigResponse = {
    type: "date"
    date: any
    id: string
    name: string
}

type titleResponse = {
    text: { content: string; link: { url: HttpRequest } | null }
}

type TitleDatabasePropertyConfigResponse = {
    type: "title"
    title: any
    id: string
    name: string
}



type AnnotationResponse = {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
    color:
    | "default"
    | "gray"
    | "brown"
    | "orange"
    | "yellow"
    | "green"
    | "blue"
    | "purple"
    | "pink"
    | "red"
    | "gray_background"
    | "brown_background"
    | "orange_background"
    | "yellow_background"
    | "green_background"
    | "blue_background"
    | "purple_background"
    | "pink_background"
    | "red_background"
}


export type TextRichTextItemResponse = {
    type: "text"
    text: { content: string; link: { url: HttpRequest } | null }
    annotations: AnnotationResponse
    plain_text: string
    href: string | null
}

type DatabasePropertyConfigResponse =

    | TitleDatabasePropertyConfigResponse
    | TextRichTextItemResponse
    | DateDatabasePropertyConfigResponse


/* Notion setting */


const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


const httpTrigger: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {
    const signature = req.headers["x-line-signature"] as string;
    console.log('httpTrigger');
    try {
        
        const events = req.body.events as WebhookEvent[];

        await Promise.all(events.map(handleEvent));
        
    } catch (error) {
        context.res = {
            status: 400,
            body: `Webhook Error: ${error}`
        };
    }
};

// 主要處理函數
async function handleEvent(event: WebhookEvent) {
    if (event.type !== "message" || event.message.type !== "text") {
        return Promise.resolve(null);
    }
	
	return handleAddTalkLine(event);
	
}



async function handleAddTalkLine(event: WebhookEvent) {
    if (event.type !== "message" || event.message.type !== "text") {
        return Promise.resolve(null);
    }
    const contentToAdd = event.message.text;   
    const properties = {
        "TalkLine": {
            type: "title",
            title: [{ type: "text", text: { content: contentToAdd } }],
        },
        "IsFeedBack": {
            type: "checkbox",
            checkbox: { checkbox: true },
        },
    };

    await addNotionPageToDatabase(databaseIdTalk, properties);

    return true;
}


async function pushMsg(msg: string) {
    
    const message: TextMessage = {
        type: 'text',
        text: msg,
    };

    // 推送訊息
    client.pushMessage(userId, message)
        .then(() => {
            console.log('Message pushed!');
        })
        .catch((err) => {
            console.error(err);
        });
}


/* Notion function */
async function addNotionPageToDatabase(databaseId, pageProperties) {
    const newPage = await notion.pages.create({
        parent: {
            database_id: databaseId,
        },
        properties: pageProperties,
    })
    console.log(newPage)
}

async function updateIsFeedBack(pageId: string) {
    await notion.pages.update({
        page_id: pageId,
        properties: {
            "IsFeedBack": {
                checkbox: true
            }
        }
    });
}

async function queryByTalkLine(databaseId: string, lastCheckedTime: Date) {
    const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
            and: [
                {
                    property: "TalkLine",
                    title: {
                         is_not_empty: true
                    }
                },
                {
                    property: "IsFeedBack",
                    checkbox: {
                        "equals": false
                    }
                }
            ]
        },
        sorts: [{ timestamp: "created_time", direction: "ascending" }],
        page_size: 1
    });

    return processTalkLineResult(response.results[0]);
}

async function processTalkLineResult(result: any) {
    if (!result) return "empty result.";

    const properties = result.properties;
    const itemProperty = properties['TalkLine'] as TitleDatabasePropertyConfigResponse;

    if (itemProperty.title && itemProperty.title.length > 0) {
        const talkLine = itemProperty.title[0].text.content;
        console.log("First TalkLine:", talkLine);

        await updateIsFeedBack(result.id);
        return talkLine;
    } else {
        console.log("No TalkLine found in the first result");
        return "empty result.";
    }
}


// 定時執行檢查
const POLLING_INTERVAL = 5 * 60 * 1000; // 5分鐘
let lastCheckedTime = new Date();

setInterval(async () => {
    const updates = await queryByTalkLine(databaseIdTalk, lastCheckedTime);
    if (updates.length > 0) {
        // 處理更新
        console.log('檢測到 Notion 更新:', updates);
        pushMsg(updates);
    }
    lastCheckedTime = new Date();
}, POLLING_INTERVAL);



/* Notion function */

export default httpTrigger;

