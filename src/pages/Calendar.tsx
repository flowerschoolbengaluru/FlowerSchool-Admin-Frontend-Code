import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, Users, IndianRupee, BookOpen, Sparkles, Flower } from "lucide-react";
import floralCalendar from "@/assets/FlowerCalender.jpg";
import api from '@/lib/api';
import { BookingModal } from "@/components/BookingModal";
import { Event } from "@/types/event";

// Custom Calendar Component
const CustomCalendar = ({
  selectedDate,
  onSelect,
  events,
  getEventsForDate,
  hasEvents
}: {
  selectedDate: Date | undefined;
  onSelect: (date: Date) => void;
  events: Event[];
  getEventsForDate: (date: Date) => Event[];
  hasEvents: (date: Date) => boolean;
}) => {
  // Initialize calendar to current month and year
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    return { daysInMonth, startingDay, year, month };
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Function to go to current month
  const goToCurrentMonth = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const { daysInMonth, startingDay, year, month } = getDaysInMonth(currentDate);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Create empty cells for days before the first day of the month
  const emptyCells = Array.from({ length: startingDay }, (_, i) => (
    <div key={`empty-${i}`} className="h-20 sm:h-24 p-1 border border-transparent"></div>
  ));

  // Create cells for each day of the month
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(year, month, day);
    const isSelected = selectedDate &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();

    const isToday = new Date().toDateString() === date.toDateString();
    const dateEvents = getEventsForDate(date);
    const hasEvent = hasEvents(date);

    return (
      <div
        key={day}
        className={`h-20 sm:h-24 p-1 sm:p-2 border rounded-lg cursor-pointer transition-all duration-200 ${isSelected
            ? "bg-primary text-primary-foreground border-primary shadow-lg transform scale-105"
            : isToday
              ? "bg-secondary border-primary/50 shadow-md"
              : hasEvent
                ? "bg-primary/10 border-primary/30 hover:bg-primary/20"
                : "bg-card border-border hover:bg-accent/50"
          }`}
        onClick={() => onSelect(date)}
      >
        <div className="flex justify-between items-start">
          <span className={`text-sm sm:text-lg font-bold ${isSelected ? "text-primary-foreground" :
              isToday ? "text-primary" : "text-foreground"
            }`}>
            {day}
          </span>
          {isToday && (
            <Badge variant="secondary" className="text-xs bg-green-500 text-white hidden sm:block">
              Today
            </Badge>
          )}
        </div>

        {dateEvents.length > 0 && (
          <div className="mt-1 space-y-1">
            {dateEvents.slice(0, 2).map((event, index) => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded truncate ${isSelected
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/20 text-primary"
                  }`}
                title={event.title}
              >
                • {event.event_type}
              </div>
            ))}
            {dateEvents.length > 2 && (
              <div className={`text-xs ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}>
                +{dateEvents.length - 2} more
              </div>
            )}
          </div>
        )}
      </div>
    );
  });

  const allCells = [...emptyCells, ...dayCells];

  // Check if current month is being displayed
  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  return (
    <div className="bg-card rounded-2xl shadow-2xl p-4 sm:p-6 w-full animate-fade-in">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPreviousMonth}
          className="h-8 w-8 sm:h-10 sm:w-10 hover:scale-110 transition-transform duration-200 border-pink-600 text-pink-600 hover:bg-pink-50"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center">
            {monthNames[month]} {year}
          </h2>
          {!isCurrentMonth && (
            <Button
              variant="outline"
              size="sm"
              onClick={goToCurrentMonth}
              className="text-xs px-2 py-1 h-6 hover:scale-105 transition-transform duration-200 border-pink-600 text-pink-600 hover:bg-pink-50"
            >
              Go to Today
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={goToNextMonth}
          className="h-8 w-8 sm:h-10 sm:w-10 hover:scale-110 transition-transform duration-200 border-pink-600 text-pink-600 hover:bg-pink-50"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
        {dayNames.map((day) => (
          <div key={day} className="text-center font-semibold text-sm sm:text-lg py-1 sm:py-2 text-muted-foreground font-sans">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.slice(0, 3)}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {allCells}
      </div>

      {/* Legend */}
      <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-4 justify-center text-xs sm:text-sm font-sans">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary/20 rounded"></div>
          <span>Courses & Workshops</span>
        </div>
      </div>
    </div>
  );
};

const CalendarPage = () => {
  const [showAdmin, setShowAdmin] = useState(false);
  // Initialize selected date to today's date
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    return new Date();
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>("");

  const handleNavigation = (section: string) => {
    // Handle navigation within calendar page if needed
  };

  const toggleDescription = (eventId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError("");
        const coursesRes = await api.get('/api/courses');
        const courses = Array.isArray(coursesRes.data) ? coursesRes.data : [];

        // Map each course to a calendar event using nextbatch
        const courseEvents = courses
          .filter(course => course.nextbatch)
          .map(course => {
            // Format the image properly if it exists
            let imageUrl = '';
            if (course.image && typeof course.image === 'string') {
          
              if (course.image.startsWith('data:image/')) {
                imageUrl = course.image;
              } else if (course.image.startsWith('/9j/') || course.image.startsWith('iVBORw0KGgo')) {
                // Base64 image data - add proper prefix
                imageUrl = `data:image/jpeg;base64,${course.image}`;
              } else if (course.image.startsWith('http')) {
                // Regular URL
                imageUrl = course.image;
              } else {
                // Assume it's base64 without prefix
                imageUrl = `data:image/jpeg;base64,${course.image}`;
              }
            }

            // Determine event type based on course properties
            let eventType = 'Course';
            
            // Check various fields to determine if it's a workshop or course
            if (course.category && course.category.toLowerCase().includes('workshop')) {
              eventType = 'Workshop';
            } else if (course.title && course.title.toLowerCase().includes('workshop')) {
              eventType = 'Workshop';
            } else if (course.type && course.type.toLowerCase().includes('workshop')) {
              eventType = 'Workshop';
            } else if (course.duration && parseInt(course.duration) <= 1) {
              // Short duration (1 hour or less) might indicate workshop
              eventType = 'Workshop';
            } else if (course.sessions && course.sessions <= 2) {
              // Few sessions (2 or less) might indicate workshop
              eventType = 'Workshop';
            } else if (course.category && (
              course.category.toLowerCase().includes('beginner') ||
              course.category.toLowerCase().includes('basic') ||
              course.category.toLowerCase().includes('intro')
            )) {
              eventType = 'Workshop';
            } else {
              eventType = 'Course';
            }

            return {
              id: course.id || course.title,
              title: course.title || 'Course',
              event_type: eventType,
              event_date: course.nextbatch,
              event_time: '',
              instructor: course.instructor || '',
              duration: course.duration || '',
              spots_left: course.capacity ? (course.capacity - (course.enrolled || 0)) : null,
              amount: course.price || '',
              description: course.description || '',
              booking_available: true,
              image: imageUrl,
            };
          });

        setEvents(courseEvents);
        console.log('Fetched course events:', courseEvents);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again later.');
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);
// Helper function to format duration display
const getDurationDisplay = (duration: any): string => {
    if (typeof duration === 'object' && duration?.hours) {
        return String(duration.hours);
    }
    return String(duration);
};
 const getEventsForDate = (date: Date) => {
  if (!events || events.length === 0) return [];

  // Create date string in local timezone for comparison
  const dateString = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  
  return events.filter(event => {
    try {
      const eventDate = new Date(event.event_date);
      // Convert event date to local timezone string for accurate comparison
      const eventDateString = eventDate.toLocaleDateString('en-CA');
      
      return eventDateString === dateString;
    } catch (error) {
      console.error('Error parsing event date:', event.event_date, error);
      return false;
    }
  });
};

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "course":
        return "bg-blue-500 text-white";
      case "workshop":
        return "bg-orange-500 text-white";
      case "class":
        return "bg-blue-500 text-white";
      case "delivery":
        return "bg-green-500 text-white";
      case "event":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const hasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Function to truncate description for preview
  const truncateDescription = (description: string, maxLength: number = 100) => {
    if (!description) return "No description available";
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  const isUpcomingEvent = (eventDate: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const eventDateObj = new Date(eventDate);
      eventDateObj.setHours(0, 0, 0, 0);

      return eventDateObj >= today;
    } catch (error) {
      console.error('Error parsing event date for upcoming check:', eventDate, error);
      return false;
    }
  };

  // Filter events to show upcoming events first, then all events
  const upcomingEvents = events.sort((a, b) => {
    const dateA = new Date(a.event_date);
    const dateB = new Date(b.event_date);
    const today = new Date();

    // If both are upcoming or both are past, sort by date
    const aIsUpcoming = dateA >= today;
    const bIsUpcoming = dateB >= today;

    if (aIsUpcoming && !bIsUpcoming) return -1;
    if (!aIsUpcoming && bIsUpcoming) return 1;

    return dateA.getTime() - dateB.getTime();
  }) || [];

  const isBookableEvent = (eventDate: string, bookingAvailable: boolean = true) => {
    // First check if booking is available for this event type
    if (!bookingAvailable) return false;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const eventDateObj = new Date(eventDate);
      eventDateObj.setHours(0, 0, 0, 0);

      // Allow booking for future events only
      return eventDateObj >= today;
    } catch (error) {
      console.error('Error parsing event date for booking check:', eventDate, error);
      return false;
    }
  };

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onAdminClick={() => setShowAdmin(true)} onNavigate={handleNavigation} />

      <main className="sm:pt-25">
        {/* Page Header with Image on Right and Content on Left */}
        <section className="py-8 sm:py-16 animate-fade-in">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Content */}
              <div className="text-center lg:text-left order-2 lg:order-1 animate-slide-in-left">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 border border-pink-200 animate-pulse">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
                  <span className="text-pink-700 font-semibold font-sans text-sm sm:text-base"> Calendar</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
                  <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    Calendar
                  </span>
                </h2>

                <p className="text-base sm:text-lg text-gray-900 mb-4 sm:mb-6 leading-relaxed font-sans">
                  Discover our comprehensive schedule of floral workshops, classes, and special events.
                  Plan your floral journey with our interactive calendar and never miss an opportunity
                  to learn and create with flowers.
                </p>


                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-sans">
                    <Flower className="h-4 w-4 text-pink-500" />
                    <span>Professional Flower Classes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-sans">
                    <CalendarDays className="h-4 w-4 text-green-500" />
                    <span>Workshops</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-sans">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>Expert Instructors</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Image */}
              <div className="order-1 lg:order-2 animate-slide-in-right">
                <div className="relative">
                  <img
                    src={floralCalendar}
                    alt="Floral calendar with weekly schedule"
                    className="w-full h-90 sm:h-70 lg:h-90 object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BIG CALENDAR SECTION */}
        <section className="py-8 md:py-16 animate-fade-in-up">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 md:gap-10">

              {/* BIG Custom Calendar - Takes 2 columns */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                <CustomCalendar
                  selectedDate={selectedDate}
                  onSelect={setSelectedDate}
                  events={events}
                  getEventsForDate={getEventsForDate}
                  hasEvents={hasEvents}
                />
              </div>

              {/* Events for Selected Date */}
              <div className="animate-fade-in-up order-1 lg:order-2" style={{ animationDelay: '0.2s' }}>
                <Card className="shadow-2xl rounded-2xl border-0 h-full hover:shadow-3xl transition-all duration-300">
                  <CardHeader className="pb-4 pt-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl font-bold">
                      <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      {selectedDate ? (
                        <span>{formatEventDate(selectedDate.toISOString())}</span>
                      ) : (
                        'Selected Date'
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    {!selectedDate ? (
                      <div className="text-center py-6 sm:py-8">
                        <CalendarDays className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground text-base sm:text-lg font-sans">
                          Select a date to view events
                        </p>
                      </div>
                    ) : selectedDateEvents.length === 0 ? (
                      <div className="text-center py-6 sm:py-8">
                        <CalendarDays className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground text-base sm:text-lg font-sans">
                          No events scheduled for this date
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 font-sans">
                          Check other dates for upcoming events
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-2">
                        {selectedDateEvents.map((event) => {
                          const isUpcoming = isUpcomingEvent(event.event_date);
                          const canBook = isBookableEvent(event.event_date, event.booking_available);

                          return (
                            <div
                              key={event.id}
                              className={`border-2 rounded-xl transition-all duration-300 hover:shadow-md overflow-hidden ${!isUpcoming
                                  ? 'bg-muted/30 border-muted opacity-70'
                                  : 'bg-card border-border hover:border-primary/30'
                                }`}
                            >
                              {/* Course Image */}
                              {event.image && (
                                <div className="w-full h-48 sm:h-56 overflow-hidden bg-gray-100">
                                  <img 
                                    src={event.image} 
                                    alt={event.title}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      console.log('Image failed to load:', event.image);
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.parentElement!.innerHTML = `
                                        <div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                                          <div class="text-center">
                                            <svg class="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p class="text-sm">Course Image</p>
                                          </div>
                                        </div>
                                      `;
                                    }}
                                  />
                                </div>
                              )}

                              <div className="p-3 sm:p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <h4 className="font-bold text-lg sm:text-xl leading-tight mb-2">{event.title}</h4>
                                    <div className="flex flex-wrap gap-2">
                                      <Badge className={`text-xs sm:text-sm ${getEventTypeColor(event.event_type)} font-sans`}>
                                        {event.event_type}
                                      </Badge>
                                      {!isUpcoming && (
                                        <Badge variant="secondary" className="text-xs bg-gray-500 text-white font-sans">
                                          Past Event
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Course Details Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                  {event.event_time && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium font-sans">
                                      <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                                      <span>{event.event_time}</span>
                                    </div>
                                  )}

                                  {event.instructor && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium font-sans">
                                      <Users className="h-4 w-4 text-primary flex-shrink-0" />
                                      <span>Instructor: {event.instructor}</span>
                                    </div>
                                  )}
          {event.duration !== undefined && event.duration !== null && (
    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium font-sans">
        <Clock className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="whitespace-nowrap">
            {`Duration(per session): ${getDurationDisplay(event.duration)}`}
        </span>
    </div>
)}

                                  {event.spots_left !== null && event.spots_left !== undefined && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium font-sans">
                                      <Users className="h-4 w-4 text-primary flex-shrink-0" />
                                      <span>Spots left: {event.spots_left}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Price */}
                                {event.amount !== undefined && event.amount !== null && String(event.amount).length > 0 && parseFloat(String(event.amount)) > 0 && (
                                  <div className="flex items-center gap-2 text-lg font-bold text-primary mb-4">
                                    <IndianRupee className="h-5 w-5" />
                                    <span>₹{String(event.amount)}</span>
                                  </div>
                                )}

                                {/* Description */}
                                {('description' in event) && event.description && (
                                  <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <BookOpen className="h-4 w-4 text-primary" />
                                      <span className="text-sm font-medium font-sans">Course Description</span>
                                    </div>
                                    <p className="text-sm text-foreground font-sans leading-relaxed">
                                      {String(event.description)}
                                    </p>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2">
                                  {canBook && (
                                    <div className="grid grid-cols-1 gap-2">
                                      <Button
                                        size="lg"
                                        className="w-full text-sm font-sans bg-orange-600 hover:bg-orange-700"
                                        onClick={() => {
                                          setSelectedEvent(event);
                                          setIsBookingModalOpen(true);
                                        }}
                                      >
                                        Enroll Now
                                      </Button>
                                    </div>
                                  )}

                                  {!event.booking_available && isUpcoming && (
                                    <div className="text-sm text-yellow-600 font-sans text-center py-2 bg-yellow-50 rounded-lg">
                                      Enrollment not available for this course
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {/* Booking Modal */}
      {selectedEvent && (
        <BookingModal
          event={selectedEvent}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default CalendarPage;
