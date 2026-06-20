import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  private hubConnection!: signalR.HubConnection;

  // Subjects لكل نوع من الأحداث
  public chatMessages = new BehaviorSubject<any[]>([]);
  public notifications = new BehaviorSubject<any[]>([]);
  public sessionUpdates = new BehaviorSubject<any>(null);
  public videoCalls = new BehaviorSubject<any>(null);

  constructor() {}

  // تشغيل الاتصال
  public startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://yourbackend.com/hub', { withCredentials: true }) // لو عندك auth
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.error('Error while starting SignalR: ' + err));

    this.registerEvents();
  }

  // تسجيل كل الأحداث
  private registerEvents() {
    // Chat
    this.hubConnection.on('ReceiveMessage', (message) => {
      this.chatMessages.next([...this.chatMessages.value, message]);
    });

    // Notifications
    this.hubConnection.on('ReceiveNotification', (notification) => {
      this.notifications.next([...this.notifications.value, notification]);
    });

    // Session Updates
    this.hubConnection.on('SessionUpdated', (session) => {
      this.sessionUpdates.next(session);
    });

    // Video Call Events (Start, Offer, Answer, End)
    this.hubConnection.on('VideoCallEvent', (data) => {
      this.videoCalls.next(data);
    });
  }

  // ارسال رسالة شات
  public sendMessage(message: any) {
    this.hubConnection.invoke('SendMessage', message)
      .catch(err => console.error(err));
  }

  // ارسال إشعار أو أي حدث تاني
  public sendNotification(notification: any) {
    this.hubConnection.invoke('SendNotification', notification)
      .catch(err => console.error(err));
  }
}
