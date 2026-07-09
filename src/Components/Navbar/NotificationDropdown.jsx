import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Mail, CheckSquare, Clipboard, FileCheck, Info, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { getStoredUser } from '../../Services/checkLogin';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    // 1. Mark as read
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
    setIsOpen(false);

    // 2. Navigation Routing logic based on type and role
    const currentUser = getStoredUser();
    const role = currentUser?.role?.toLowerCase();

    if (['new_project', 'project_finished', 'milestones_finished', 'new_milestones', 'milestones_accepted'].includes(notif.type)) {
      if (notif.reference_id) {
        navigate(`/projects/${notif.reference_id}`);
      } else {
        navigate(role === 'client' ? '/client/projects' : '/expert/projects');
      }
    } else if (['milestone_submitted', 'milestone_approved', 'milestone_rejected'].includes(notif.type)) {
      // These reference milestone ID. Since the milestone details are contextual to projects, 
      // redirecting to project lists is a reliable fallback.
      navigate(role === 'client' ? '/client/projects' : '/expert/projects');
    } else if (['new_proposal', 'counter_proposal', 'proposal_accepted'].includes(notif.type)) {
      if (role === 'client') {
        navigate('/client/dashboard');
      } else {
        if (notif.reference_id) {
          navigate(`/expert/proposal/${notif.reference_id}`);
        } else {
          navigate('/expert/dashboard');
        }
      }
    } else {
      navigate(role === 'client' ? '/client/dashboard' : '/expert/dashboard');
    }
  };

  // Helper to choose background indicator / icon for notification type
  const getIconForType = (type) => {
    switch (type) {
      case 'new_proposal':
      case 'counter_proposal':
        return <Mail size={16} className="text-sky-blue" />;
      case 'proposal_accepted':
      case 'new_project':
        return <FileCheck size={16} className="text-emerald" />;
      case 'new_milestones':
      case 'milestones_accepted':
        return <Clipboard size={16} className="text-purple" />;
      case 'milestone_submitted':
        return <CheckSquare size={16} className="text-warning" />;
      case 'milestone_approved':
      case 'milestones_finished':
      case 'project_finished':
        return <Check size={16} className="text-success" />;
      case 'milestone_rejected':
        return <Info size={16} className="text-danger" />;
      default:
        return <Bell size={16} className="text-muted" />;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-dropdown-container" ref={dropdownRef}>
      <button 
        className="icon-button position-relative" 
        aria-label={`${unreadCount} unread notifications`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="icon-badge bg-sky">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown-menu">
          <div className="notif-dropdown-header">
            <h6 className="m-0 font-weight-bold">Notifications</h6>
            {unreadCount > 0 && (
              <button className="btn-mark-all-read" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="notif-dropdown-list">
            {notifications.length === 0 ? (
              <div className="notif-empty-state">
                <Bell size={32} className="text-muted mb-2" />
                <p className="m-0 text-secondary">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`notif-dropdown-item ${notif.is_read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notif-item-icon-wrapper">
                    {getIconForType(notif.type)}
                  </div>
                  <div className="notif-item-content">
                    <div className="notif-item-title-row">
                      <span className="notif-item-title">{notif.title}</span>
                      <span className="notif-item-time">{formatTime(notif.created_at)}</span>
                    </div>
                    <p className="notif-item-message">{notif.message}</p>
                  </div>
                  {!notif.is_read && <span className="notif-unread-indicator-dot"></span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
