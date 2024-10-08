import NavBar from "../components/NavBar"
import { useState, useEffect } from "react"
import ProfilePic from "../components/ProfilePic";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faEnvelopeCircleCheck} from '@fortawesome/free-solid-svg-icons'
import { NotificationType } from "../types";

type Notifications = NotificationType[] | null

export default function NotificationTab() {
    const [notifications, setNotifications] = useState<Notifications>(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/notifications', {
            method: 'GET',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          })
          .then(res => {
            if (res.ok) { return res.json() }
            throw Error
          })
          .then(res => {
            console.log(res);
            setNotifications(res.notifications);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/');
            }
        })

    }, [])

    const convertDate = (date: Date) => {
        const readableDate: any = new Date(date);
        const currentDate: any = new Date();

        const differenceInMs = Math.abs(currentDate - readableDate);
        const differenceInSeconds = differenceInMs / 1000 
        const differenceInMinutes = differenceInSeconds / 60 
        const differenceInHours = differenceInMinutes / 60 
        const differenceInDays = differenceInHours / 24 
        const differenceInWeeks = differenceInDays / 7

        if (differenceInWeeks >= 1) return Math.floor(differenceInWeeks) + 'w'
        if (differenceInDays >= 1) return Math.floor(differenceInDays) + 'd'
        if (differenceInHours >= 1) return Math.floor(differenceInHours) + 'h'
        if (differenceInMinutes >= 1) return Math.floor(differenceInMinutes) + 'm'
        if (differenceInSeconds >= 1) return Math.floor(differenceInSeconds) + 's'
    }

    const routeToResource = (notification: NotificationType) => {
        fetch(`/api/notifications/${notification._id}`, {
            method: 'PUT',
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          })
          .then(res => {
            if (res.ok) { return res.json() }
            throw Error
          })
          .then(res => {
            console.log(res);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/');
            }
        })

        if (notification.from_type === "User") {
            navigate(`/dms/${notification.conversation_id}`)
        } else if (notification.from_type === "Conversation" && 
            notification.update === "You are the new owner." ||
            notification.update === "You are now an admin." ||
            notification.update === "You are no longer an admin."
        ) {
            navigate(`/groups/${notification.conversation_id}/settings`)
        } else if (notification.from_type === "Conversation" &&
            notification.update === "You have been kicked."
        ) {
            navigate(`/groups`)
        } else if (notification.from_type === "Conversation") {
            navigate(`/groups/${notification.conversation_id}`)
        }
    }

    const markAllAsRead = () => {
        fetch('/api/notifications', {
            method: 'PUT',
            credentials: "include",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
        .then(res => {
            if (res.ok) { return res.json() }
            throw Error
        })
        .then(res => {
            console.log(res);
            setNotifications(res.notifications);
        })
        .catch(err => {
            console.log(err);
            if (err.code === 401) {
                navigate('/');
            }
        })
    }

    return(
        <div className="messages-page">
            <div className="users-header">
                <h1 style={{ margin: 0 }}>Notifications</h1>
                <button style={{all: "unset"}} onClick={markAllAsRead}>
                    <FontAwesomeIcon icon={faEnvelopeCircleCheck} className="file-upload-icon" style={{ height: "3rem" }}/>
                </button>
            </div>
            <div className="flexible-section">
                <div className="notifications-container">
                    { notifications &&
                        notifications.map((notification) => {
                            return (
                                <div key={notification._id}>
                                    <div className={`notification ${!notification.is_read && "new"}`} onClick={() => {routeToResource(notification)}}>
                                        <ProfilePic imageSrc={notification.from.profile_picture && notification.from.profile_picture} size="4rem" group={ notification.from_type === "Conversation" && true}/>
                                        <div className="name-message">
                                            <h1 style={{ margin: 0, overflowWrap: "break-word" }}>{ notification.from.display_name ? notification.from.display_name : "Group" }</h1>
                                            <p style={{ margin: 0}}>{notification.update}</p>
                                        </div>
                                        <p style={{ color: "grey" }}>{convertDate(notification.createdAt)}</p>
                                    </div>
                                    <hr style={{ margin: 0 }}/>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <NavBar active='Notifications'/>
        </div>
    )
}