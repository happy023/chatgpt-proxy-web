import * as common from "./common.js";
import * as chat from './chat.js';
import { mdHtml } from "./markdown.js";


export function updateContext(contextarray) {
    if (!chat.getContextId()) {
        throw new Error('发生错误，没有初始化聊天上下文');
    }
    //持久化上下文
    let record = saveContext(chat.getContextId(), contextarray);
    //界面历史记录栏更新
    const contextId = record.contextId;
    let talkDiv = $('#' + contextId);
    let talkSize = record.contextarray.length;
    let talkTime = record.talkTime;
    if (talkDiv.length === 0) {
        $('#chat-history-content').append(`
            <div class="chat-history-item chat-history-item-selected" id="` + chat.getContextId() + `">
                <div>
                    <div class="chat-history-title">` + record.prompt + `</div>
                    <div class="chat-history-time">
                        <span>`+ talkSize + `条对话</span>
                        <span>`+ talkTime + `</span>
                    </div>
                </div>
            </div>
        `);
        (function (contextId) {
            $('#' + contextId).click(() => loadTalkContext(contextId));
        })(contextId);
        //选中当前项
        selectTalkRecord(contextId);
    } else {
        $('#' + contextId + '>div>.chat-history-time')
            .html('<span>' + talkSize + '条对话</span><span>' + talkTime + '</span>');
    }
}

export function loadTalkList() {
    let contextIdList = getContextIdList();
    for (let i = 0; i < contextIdList.length; i++) {
        const contextId = contextIdList[i];
        let context = findContextById(contextId);

        const prompt = context.prompt;
        const talkSize = context.contextarray.length;
        const talkTime = context.talkTime;

        $('#chat-history-content').append(`
            <div class="chat-history-item" id="` + contextId + `"> 
                <div>
                    <div class="chat-history-title">` + prompt + `</div>
                    <div class="chat-history-time">
                        <span>`+ talkSize + `条对话</span>
                        <span>`+ talkTime + `</span>
                    </div>
                </div>
            </div>
        `);

        (function (contextId) {
            $('#' + contextId).click(() => loadTalkContext(contextId));
        })(contextId);
    }
}

export function newTalk() {
    if (chat.getContextId()) {
        $("#article-wrapper").html("");
    }
    chat.setContextarray([]);
    chat.setContextId('talk-' + common.randomString());
    deselectAllRecords();
}

function findContextById(contextId) {
    let storeId = contextIdToStoreId(contextId);
    let context;
    let contextStr = localStorage.getItem(storeId);
    if (!contextStr) {
        throw new Error('找不到contextId:' + contextId + '对应的数据!');
    }
    context = JSON.parse(contextStr);
    return context;
}

function nowTime() {
    let time = (new Date(new Date().getTime() + 1000 * 60 * 60 * 8)).toISOString();
    return time.substring(0, 19).replace('T', ' ');
}

function contextIdToStoreId(contextId) {
    return contextId;
}

function getContextIdList() {
    return JSON.parse(localStorage.getItem('contextIdList') || '[]');
}

function addContextId(contextId) {
    let contextIdList = getContextIdList();
    contextIdList.push(contextId);
    localStorage.setItem('contextIdList', JSON.stringify(contextIdList));
}

function saveContext(contextId, contextarray) {
    if (!contextId || !contextarray) {
        throw new Error('参数不能为空');
    }
    let storeId = contextIdToStoreId(contextId);
    let talkStr = localStorage.getItem(storeId);
    let record;
    if (!talkStr) {
        record = {
            contextId: contextId,
            prompt: contextarray[0][0],
            contextarray: []
        };
        addContextId(contextId);
    } else {
        record = JSON.parse(talkStr);
    }
    //追加最后一条对话
    record.contextarray.push(contextarray[contextarray.length - 1]);
    record.talkTime = nowTime();
    localStorage.setItem(storeId, JSON.stringify(record));
    return record;
}

function loadTalkContext(contextId) {
    let context = findContextById(contextId);
    //更新全局变量
    chat.setContextId(contextId);
    chat.setContextarray(context.contextarray);
    //清除界面聊天内容
    $("#article-wrapper").html("");

    //选中当前项
    selectTalkRecord(contextId);

    let items = context.contextarray;
    for (let i = 0; i < items.length; i++) {
        let prompt = items[i][0];
        let answer = items[i][1];

        let chatId = common.randomString(16);
        let aChatId = 'ac-' + chatId;
        let qChatId = 'q-' + chatId;

        //问题
        $("#article-wrapper").append('<li class="article-title"><div class="avatar">😃 :</div><pre id="' + qChatId + '"></pre></li>');
        $("#" + qChatId).text(prompt); 

        //答案
        $("#article-wrapper").append('<li class="article-content" id="' + chatId + '"><div class="avatar">🐶 :</div><div id="' + aChatId + '"></div></li>');
        answer = mdHtml.render(answer);
        $("#" + aChatId).html(answer);
        
        //如果有代码，需要加上复制按钮
        $("#" + chatId + " pre code").each(function () {
            $(this).html("<button class='codebutton'>复制</button>" + $(this).html());
            $(this).find('.codebutton').first().click(common.copycode);
        });
    }
}

function deselectAllRecords() {
    $('.chat-history-item').each((_, item) => {
        $(item).removeClass('chat-history-item-selected');
    });
}

function selectTalkRecord(id) {
    deselectAllRecords();
    $('#' + id).addClass('chat-history-item-selected');
}