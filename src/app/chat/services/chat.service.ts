import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';

import {ChatSession} from '../models/chatSession';
import {User} from '../../shared/models/user';
import {ChatMessage} from '../models/chatMessage';

/**
 *
 * https://blog.panoply.io/dynamodb-vs-mongodb
 * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.Lambda.Tutorial.html
 * https://github.com/simalexan/dynamodb-lambda-publisher-sns
 */

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  url = 'https://npkkkpl1gi.execute-api.us-east-2.amazonaws.com/dev/serverlessrepo-chatSessio-microservicehttpendpoint-4V46OS50EN84'

  constructor(private httpClient: HttpClient) {
  }

  /**
   * get Get all active chat sessions
   *
   * @returns test
   */
  public async getActiveChatSessions(): Promise<any> {

    try {
      const chatSessions: ChatSession[] = await
        this.httpClient.get<any>(this.url).pipe(
          map(result => {
            const chatSess: ChatSession[] = [];
            result['Items'].forEach(item => {
              chatSess.push({
                id: item['id'],
                chatResponderName: item['chatResponderName'],
                chatInitiatorName: item['chatInitiatorName'],
                chatSessionActive: item['chatSessionActive'],
                messages: item['messages']
              });
            });
            return chatSess;
          })).toPromise();
      return chatSessions;

    } catch (e) {
      console.log('error getting messages', e);
      return [];
    }

  }

  /**
   * get Get all active chat sessions
   *
   * @returns test
   */
  public async getChatSessionById(id: string): Promise<ChatSession> {

    try {
      const chatSession: any = await
        this.httpClient.get<ChatSession>(this.url + `?id=${id}`).pipe(
          map(result => {
            console.log('result', result);
            const item = result['Item'];
            const chatSess: ChatSession = {
              id: item['id'],
              chatResponderName: item['chatResponderName'],
              chatInitiatorName: item['chatInitiatorName'],
              chatSessionActive: item['chatSessionActive'],
              messages: item['messages'] ? item['messages'] : []
            };
            return chatSess;
          })).toPromise();
      // console.log('got chat session', chatSession);
      return chatSession;

    } catch (e) {
      console.log('error getting chat session', e);
      return undefined;
    }

  }


  public async takeChat(chatSession: ChatSession, user: User) {
    try {
      const response = await
        this.httpClient.put<any>(this.url,
          {
            id: chatSession.id,
            chatResponderName: user.name,
            chatSessionActive: true
          }).toPromise();
      return response;

    } catch (e) {
      console.log('error getting messages', e);
      return [];
    }


  }

  public async quitChat(chatSession: ChatSession) {
    try {
      const response = await
        this.httpClient.put<any>(this.url,
          {
            id: chatSession.id,
            chatResponderName: chatSession.chatResponderName,
            chatSessionActive: false
          }).toPromise();
      return response;

    } catch (e) {
      console.log('error getting messages', e);
      return [];
    }


  }



  public async requestChat(name: string, uid: string) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    const options = {
      headers: headers
    };
    try {
      const response = await
        this.httpClient.post<any>(this.url,
          {
            chatInitiatorName: name,
            id: uid
          }, options).toPromise();
      return response;

    } catch (e) {
      console.log('error getting messages', e);
      return [];
    }


  }

  public async sendChatMessages(chatMessages: ChatMessage[], chatSessionId: string) {
    try {
      const body = {
        id: chatSessionId,
        messages: this.getMessages(chatMessages),
      };
      console.log('body', body);

      const response = await
        this.httpClient.put<any>(this.url,
          body).toPromise();
      return response;

    } catch (e) {
      console.log('error sending messages', e);
      return undefined;
    }
  }

  private getMessages(chatMessages: ChatMessage[]) {
    const messages = [];
    chatMessages.forEach((chatMessage: ChatMessage) => {
      messages.push({
        id: chatMessage.id,
        sender: chatMessage.sender,
        message: chatMessage.message
      });
    });
    return messages;

  }
}
