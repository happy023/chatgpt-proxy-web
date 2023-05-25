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
        $('#talk-history-content').append(`
            <div class="talk-history-item talk-history-item-selected" id="` + chat.getContextId() + `">
                <div>
                    <div class="talk-history-title">` + record.prompt + `</div>
                    <div class="talk-history-time">
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
        $('#' + contextId + '>div>.talk-history-time')
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

        $('#talk-history-content').append(`
            <div class="talk-history-item" id="` + contextId + `"> 
                <div>
                    <div class="talk-history-title">` + prompt + `</div>
                    <div class="talk-history-time">
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

        let talkId = common.randomString(16);
        //问题
        $("#article-wrapper").append('<li class="article-title" id="q' + talkId + '"><pre></pre></li>');
        for (let j = 0; j < prompt.length; j++) {
            $("#q" + talkId).children('pre').text($("#q" + talkId).children('pre').text() + prompt[j]);
        }
        //答案
        $("#article-wrapper").append('<li class="article-content" id="' + talkId + '"></li>');
        answer = mdHtml.render(answer);
        $("#" + talkId).html(answer);
    }
}

function deselectAllRecords() {
    $('.talk-history-item').each((_, item) => {
        $(item).removeClass('talk-history-item-selected');
    });
}

function selectTalkRecord(id) {
    deselectAllRecords();
    $('#' + id).addClass('talk-history-item-selected');
}