import Container from "react-bootstrap/Container";
import Calendar from '@toast-ui/react-calendar';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import React from "react";
import './AvailabilitiesTable.css'

export function AvailabilitiesTable() {
  const calendars = [{ id: 'cal1', name: 'Personal' }];
  const initialEvents = [
    {
      id: '1',
      calendarId: 'cal1',
      title: 'Lunch',
      category: 'time',
      start: '2024-05-30T12:00:00',
      end: '2024-05-30T13:30:00',
    },
    {
      id: '2',
      calendarId: 'cal1',
      title: 'Coffee Break',
      category: 'time',
      start: '2022-06-28T15:00:00',
      end: '2022-06-28T15:30:00',
    },
  ];

  const onAfterRenderEvent = (event) => {
    console.log(event.title);
  };

  return (
    <div style={{position: 'center', height:'350px', width:'750px'}} >
      <Calendar
        view="week"
        isReadOnly= {false}
        week={{
          dayNames: ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'],
          showNowIndicator: true,
  
          timezonesCollapsed: false,
          hourStart: 9,
          hourEnd: 20,
          eventView: true,
          default: true,
          taskView: false,
          collapseDuplicateEvents: false,

        }}
        calendars={calendars}
        events={initialEvents}
        onAfterRenderEvent={onAfterRenderEvent}
      />
    </div>
  );
}

export default AvailabilitiesTable;
