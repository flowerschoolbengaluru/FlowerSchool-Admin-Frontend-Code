import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Star, BookOpen, ImageIcon, ArrowRight, GraduationCap, Award, Target, Heart, ChevronDown, ChevronUp } from "lucide-react";
import api, { endpoints } from "@/lib/api";
import { BookingModal } from "@/components/BookingModal";
import schoolClassroomImage from "@/assets/school-classroom.jpg";
import schoolGraduationImage from "@/assets/school-graduation.jpg";      

interface Feature {
  topic: string;
}

interface FlowerClass {
  id: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  discountPercentage?: number;
  discountAmount?: number;
  duration: string;
  sessions: number;
  features: Feature[];
  popular: boolean;
  nextbatch: string;
  created_at: string;
  image: string | null;
  category?: "Diploma Course" | "Workshops" | string | null;
  capacity?: number;
  enrolled?: number;
  rating?: number;
  paymentOption?: 'now' | 'later';
}

interface Achievement {
  title: string;
  description: string;
  icon: JSX.Element;
  gradient: string;
}

const Classes = () => {
  const [classes, setClasses] = useState<FlowerClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());
  const coursesSectionRef = useRef<HTMLDivElement>(null);

  // Achievements data following project patterns
  const achievements: Achievement[] = [
    {
      title: "Expert Instructors",
      description: "Learn from certified master florists with years of professional experience",
      icon: <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8" />,
      gradient: "from-pink-500 to-rose-500"
    },
    {
      title: "Hands-On Training",
      description: "Practice with real flowers and professional equipment in our modern studios",
      icon: <Target className="h-6 w-6 sm:h-8 sm:w-8" />,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Industry Recognition",
      description: "Receive certificates that are valued by employers and floral industry professionals",
      icon: <Award className="h-6 w-6 sm:h-8 sm:w-8" />,
      gradient: "from-rose-500 to-pink-500"
    },
    {
      title: "Passionate Community",
      description: "Join a supportive network of flower enthusiasts and professional florists",
      icon: <Heart className="h-6 w-6 sm:h-8 sm:w-8" />,
      gradient: "from-pink-500 to-purple-500"
    }
  ];

  // Enhanced base64 image handler following project patterns
  const formatImageSrc = (image) => {
    if (!image) return "";

    // Case 1: Full Base64 with prefix
    if (image.startsWith("data:image")) {
      return image;
    }

    // Case 2: Raw Base64 (no prefix yet)
    if (/^[A-Za-z0-9+/=]+$/.test(image)) {
      return `data:image/png;base64,${image}`;
    }

    // Case 3: Normal image path or URL
    return `/uploads/${image}`;
  };

  const handleImageError = (imageId: string) => {
    console.warn(`Image failed to load for course: ${imageId}`);
    setImageErrors(prev => new Set(prev).add(imageId));
  };

  const handleImageLoad = (imageId: string) => {
    // Remove from error set if image loads successfully
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  };

  const toggleDescription = (courseId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const isDescriptionExpanded = (courseId: string) => {
    return expandedDescriptions.has(courseId);
  };

  // Convert FlowerClass data to Event format for BookingModal
  const convertToEvent = (course: FlowerClass) => {
    return {
      id: course.id,
      title: course.title,
      event_type: course.category === "Diploma Course" ? "Course" : "Workshop",
      event_date: course.nextbatch || "TBD",
      event_time: "Contact for timing",
      duration: course.duration,
      instructor: "Expert Instructor",
      spots_left: (course.capacity || 20) - (course.enrolled || 0),
      image: course.image,
      booking_available: true,
      amount: parseInt(course.price) || 0,
      created_at: course.created_at,
      updated_at: course.created_at
    };
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        console.log('Fetching courses...');

        const coursesRes = await api.get(endpoints.courses);
        console.log('API Response - Courses:', coursesRes.data);

        const processData = (data: any[]): FlowerClass[] => {
          if (!Array.isArray(data)) {
            console.warn('Invalid data format received:', data);
            return [];
          }

          return data.map((cls: any) => {
            console.log('Processing course image:', cls.title, 'Image type:', typeof cls.image, 'Image length:', cls.image?.length);

              // normalize features: backend may return JSON-string, bracketed string, comma-separated or array
              const normalizeFeatures = (raw: any): Feature[] => {
                try {
                  if (!raw) return [{ topic: "Comprehensive floral training" }];

                  // If it's already an array
                  if (Array.isArray(raw)) {
                    return raw.map((f: any) => ({ topic: typeof f === 'string' ? f : (f.topic || 'Feature') }));
                  }

                  // If it's a JSON string like '["a","b"]'
                  if (typeof raw === 'string') {
                    const trimmed = raw.trim();

                    // Sometimes the backend stores a JS-style array as a string, try JSON.parse
                    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
                      try {
                        const parsed = JSON.parse(trimmed);
                        if (Array.isArray(parsed)) {
                          return parsed.map((f: any) => ({ topic: typeof f === 'string' ? f : (f.topic || 'Feature') }));
                        }
                        // if parsed object, fallthrough
                      } catch (e) {
                        // fallthrough to comma-split
                      }
                    }

                    // Fallback: comma separated string
                    return trimmed.split(/,|\n/).map(s => ({ topic: s.trim() })).filter(f => f.topic.length > 0);
                  }

                  // final fallback
                  return [{ topic: String(raw) }];
                } catch (e) {
                  return [{ topic: "Comprehensive floral training" }];
                }
              };

              // Normalize category to match filter options
              let normalizedCategory = "";
              if (typeof cls.category === "string") {
                const cat = cls.category.trim().toLowerCase();
                if (cat === "diploma course" || cat === "diploma courses") {
                  normalizedCategory = "Diploma Course";
                } else if (cat === "workshops" || cat === "special workshops") {
                  normalizedCategory = "Workshops";
                } else {
                  normalizedCategory = cls.category;
                }
              } else {
                normalizedCategory = "Beginner";
              }

              return {
                id: cls.id?.toString() || crypto.randomUUID(),
                title: cls.title || "Untitled Course",
                description: cls.description || "No description available",
                price: cls.price?.toString() || "0",
                duration: cls.duration || "Not specified",
                sessions: cls.sessions || 1,
                features: normalizeFeatures(cls.features),
                popular: Boolean(cls.popular),
                nextbatch: cls.nextbatch || "Coming soon",
                created_at: cls.created_at || new Date().toISOString(),
                image: cls.image, // Keep original image data for processing
                category: normalizedCategory,
                capacity: cls.capacity || 20,
                enrolled: cls.enrolled || 0,
                rating: cls.rating || 4.5,
              };
          });
        };

        const processedClasses = processData(coursesRes.data || []);
        console.log('Processed classes:', processedClasses);
        setClasses(processedClasses);

      } catch (error) {
        console.error("API fetch failed:", error);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    // Trigger animation on component mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const filtered = selectedLevel === "All"
    ? classes
    : classes.filter((cls) => cls.category === selectedLevel);

  // Scroll to courses section and set filter
  const handleCourseTypeClick = (level: string) => {
    setSelectedLevel(level);
    setTimeout(() => {
      coursesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100); // allow filter to update first
  };

  return (
    <>
      <SEO
        title="Flower Arranging Classes in Bengaluru - Professional Courses at Bangalore Flower School"
        description="Enroll in comprehensive flower arranging classes in Bengaluru. From beginner to advanced courses, learn professional floral design techniques in bangalore."
        keywords="flower arranging classes bengaluru, flower courses bangalore, floral design classes bengaluru, professional floristry bengaluru, flower arrangement workshops bangalore, flower school classes bengaluru"
      />
      <div className="min-h-screen bg-background">
        <Header onAdminClick={() => { }} onNavigate={() => { }} />

        <main>
          {/* Hero Section */}
          <section className="mt-4 sm:mt-6 bg-white">
            <div className="container mx-auto text-center px-3 sm:px-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                Our Courses
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-800 mb-3 sm:mb-4 max-w-3xl mx-auto leading-relaxed">
                Transform your passion for flowers into professional skills with our
                expert-led courses. Whether you're a beginner or a seasoned floral designer,
                we provide hands-on training to elevate your creativity and career.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-gray-800 max-w-3xl mx-auto leading-relaxed">
                Learn advanced techniques in floral arrangement, event decoration,
                bouquet styling, and more — all guided by experienced mentors dedicated
                to helping you grow in the world of floral artistry.
              </p>
            </div>
          </section>

          
          <section className="py-6 sm:py-8 bg-white">
            <div className="container mx-auto px-3 sm:px-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-2xl mx-auto">
                {/* Diploma Courses Box */}
                <div
                  className="flex items-center gap-3 sm:gap-4 bg-white border-2 border-pink-200 rounded-xl p-3 sm:p-4 w-full sm:w-auto hover:border-pink-400 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => handleCourseTypeClick("Diploma Course")}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">Diploma Courses</div>
                    <div className="text-xs sm:text-sm text-gray-600 truncate">Professional certification programs</div>
                  </div>
                </div>

                {/* Workshops Box */}
                <div
                  className="flex items-center gap-3 sm:gap-4 bg-white border-2 border-purple-200 rounded-xl p-3 sm:p-4 w-full sm:w-auto hover:border-purple-400 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => handleCourseTypeClick("Workshops")}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">Workshops</div>
                    <div className="text-xs sm:text-sm text-gray-600 truncate">Short intensive sessions</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Main Showcase Grid */}
          <section className="py-8 sm:py-12 md:py-16 bg-white">
            <div className="container mx-auto px-3 sm:px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
                {/* Left side - Graduation image with enhanced interaction */}
                <div className="relative group cursor-pointer">
                  <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl hover:shadow-2xl sm:hover:shadow-3xl transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-bl from-rose-500/20 to-pink-500/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <img
                      src={schoolGraduationImage}
                      alt="Flower school graduation ceremony"
                      className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover transform group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-700 ease-out"
                    />

                    {/* Floating elements */}
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-3 h-3 sm:w-4 sm:h-4 bg-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                    <div className="absolute top-4 right-4 sm:top-8 sm:right-8 w-2 h-2 sm:w-3 sm:h-3 bg-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-ping" />
                  </div>
                </div>

                {/* Right side - Classroom image with enhanced interaction */}
                <div className="relative group cursor-pointer">
                  <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl hover:shadow-2xl sm:hover:shadow-3xl transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <img
                      src={schoolClassroomImage}
                      alt="Flower school classroom with students learning"
                      className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover transform group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-700 ease-out"
                    />

                    {/* Floating elements */}
                    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                    <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 w-2 h-2 sm:w-3 sm:h-3 bg-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-ping" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Filter Section */}
          <section className="py-6 sm:py-8 bg-white">
            <div className="container mx-auto px-3 sm:px-4">
              {/* Course Count */}
              <div className="text-center mb-6 sm:mb-8">
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2 text-pink-500" />
                  {classes.length} Course{classes.length !== 1 ? 's' : ''} Available
                </p>
              </div>

              {/* Level Filter */}
              <div className="flex justify-center gap-1 sm:gap-2 mb-6 sm:mb-8 flex-wrap">
                {["Diploma Course", "Workshops"].map((level) => (
                  <Button
                    key={level}
                    variant={selectedLevel === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLevel(level)}
                    className={`text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 ${
                      selectedLevel === level
                        ? "bg-pink-500 hover:bg-pink-600 text-white border-pink-500"
                        : "border-pink-300 text-pink-600 hover:bg-pink-50 hover:text-pink-700 hover:border-pink-400"
                    }`}
                  >
                    {level}
                    <span className="ml-1 text-xs">
                      ({classes.filter(cls => cls.category === level).length})
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </section>

          {/* Classes Available Section */}
          <section className="py-8 sm:py-10 bg-white" ref={coursesSectionRef}>
            <div className="container mx-auto px-3 sm:px-4">
              {filtered.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-pink-100 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">No courses found</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {selectedLevel !== "All"
                      ? `No ${selectedLevel.toLowerCase()} level courses available.`
                      : `No courses are currently available.`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                  {filtered.map((cls, index) => (
                    <Card
                      key={cls.id}
                      className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-pink-100 h-full flex flex-col"
                    >
                      {/* Course Image - Natural Size with Flexible Container */}
                      <div className="relative flex-shrink-0 bg-gray-50 min-h-[140px] sm:min-h-[160px] md:min-h-[180px] flex items-center justify-center overflow-hidden">
                        {imageErrors.has(cls.id) ? (
                          <div className="w-full h-full bg-gradient-to-br from-pink-100 via-purple-50 to-orange-100 flex items-center justify-center p-3 sm:p-4">
                            <div className="text-center">
                              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
                                <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-pink-500" />
                              </div>
                              <p className="text-xs sm:text-sm font-medium text-pink-600 truncate px-2">{cls.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">Course Image</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <img
                              src={formatImageSrc(cls.image)}
                              alt={cls.title}
                              className="w-full h-auto max-h-[200px] sm:max-h-[240px] md:max-h-[280px] object-contain"
                              onError={() => handleImageError(cls.id)}
                              onLoad={() => handleImageLoad(cls.id)}
                              loading="lazy"
                            />
                            {cls.popular && (
                              <Badge className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-orange-500 hover:bg-orange-600 text-white text-xs">
                                🔥 Popular
                              </Badge>
                            )}
                            {cls.category && (
                              <Badge variant="secondary" className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-pink-100 text-pink-700 border-pink-200 text-xs">
                                {cls.category}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>

                      {/* Card Content - Improved Alignment */}
                      <CardContent className="flex-grow flex flex-col p-3 sm:p-4 space-y-3 sm:space-y-4">
                        {/* Title and Rating */}
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 leading-tight flex-1 min-w-0">
                            <span className="line-clamp-2">{cls.title}</span>
                          </CardTitle>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs sm:text-sm font-medium text-gray-700">
                              {cls.rating?.toFixed(1) || "4.5"}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1 sm:space-y-2">
                          <div className={`text-xs sm:text-sm text-gray-600 leading-relaxed ${
                            isDescriptionExpanded(cls.id) ? '' : 'line-clamp-2'
                          }`}>
                            {cls.description}
                          </div>
                          {cls.description.length > 100 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 sm:h-6 px-1 sm:px-2 text-xs text-pink-600 hover:text-pink-700 hover:bg-pink-50 -ml-1 sm:-ml-2"
                              onClick={() => toggleDescription(cls.id)}
                            >
                              {isDescriptionExpanded(cls.id) ? (
                                <>
                                  Show less <ChevronUp className="h-3 w-3 ml-1" />
                                </>
                              ) : (
                                <>
                                  Read more <ChevronDown className="h-3 w-3 ml-1" />
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        {/* Course Details */}
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-pink-500 flex-shrink-0" />
                            <span className="truncate">Next: {cls.nextbatch}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-pink-500 flex-shrink-0" />
                            <span>Duration: {cls.duration} hours</span>
                          
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-pink-500 flex-shrink-0" />
                            <span>{cls.sessions} session{cls.sessions > 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-1.5 sm:space-y-2">
                          <h4
                            className={`text-xs sm:text-sm font-medium cursor-pointer select-none ${expandedFeatures.has(cls.id) ? 'text-pink-600' : 'text-gray-900'}`}
                            onClick={() => {
                              setExpandedFeatures(prev => {
                                const newSet = new Set(prev);
                                if (newSet.has(cls.id)) newSet.delete(cls.id);
                                else newSet.add(cls.id);
                                return newSet;
                              });
                            }}
                            role="button"
                            aria-expanded={expandedFeatures.has(cls.id)}
                          >
                            What you'll learn:
                          </h4>

                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {cls.features && cls.features.length > 0 ? (
                              (expandedFeatures.has(cls.id) ? cls.features : cls.features.slice(0, 2)).map((f, fi) => (
                                <Badge key={fi} variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-600 px-1.5 sm:px-2 py-0.5 sm:py-1">
                                  {f.topic}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">No features listed</span>
                            )}

                            {cls.features && cls.features.length > 2 && (
                              <Badge
                                variant="outline"
                                role="button"
                                aria-expanded={expandedFeatures.has(cls.id)}
                                className="text-xs bg-gray-50 border-gray-200 text-gray-600 px-1.5 sm:px-2 py-0.5 sm:py-1 cursor-pointer hover:bg-pink-50"
                                onClick={() => {
                                  setExpandedFeatures(prev => {
                                    const newSet = new Set(prev);
                                    if (newSet.has(cls.id)) newSet.delete(cls.id);
                                    else newSet.add(cls.id);
                                    return newSet;
                                  });
                                }}
                              >
                                {expandedFeatures.has(cls.id) ? 'Show less' : `+${cls.features.length - 2} more`}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Price and CTA */}
                        <div className="mt-auto pt-3 sm:pt-4 border-t border-pink-100">
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                                ₹{cls.price}
                              </span>
                              {cls.originalPrice && (
                                <span className="text-xs sm:text-sm text-gray-500 line-through">
                                  ₹{cls.originalPrice}
                                </span>
                              )}
                            </div>
                        
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            <Button
                              className="w-full font-medium bg-orange-600 hover:bg-orange-700 text-white h-9 sm:h-10 text-sm sm:text-base"
                              disabled={(cls.enrolled || 0) >= (cls.capacity || 20)}
                              onClick={() => {
                                setSelectedCourse(convertToEvent(cls));
                                setShowBookingModal(true);
                              }}
                            >
                              {(cls.enrolled || 0) < (cls.capacity || 20) ? "Enroll Now" : "Join Waitlist"}
                              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Animated Achievements Grid */}
          <section className="py-8 sm:py-12 md:py-14 bg-white">
            <div className="container mx-auto px-3 sm:px-4">
              {/* Section Header */}
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-pink-100 border border-pink-200">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-semibold text-pink-700 uppercase tracking-wide">Why Choose Us</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                   <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">What Makes Our School Special</span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                  We're committed to providing the best floral education experience with industry-leading standards and passionate mentorship.
                </p>
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                {achievements.map((achievement, index) => (
                  <div
                    key={achievement.title}
                    className={`transform transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                      }`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <Card className="h-full border border-pink-100 hover:border-pink-300 hover:shadow-xl transition-all duration-300 group bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-4 sm:p-5 md:p-6 text-center">
                        {/* Gradient Icon Container */}
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 sm:mb-5 md:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-br ${achievement.gradient} flex items-center justify-center group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          <div className="text-white">
                            {achievement.icon}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-gray-900 group-hover:text-pink-600 transition-colors duration-300">
                          {achievement.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {achievement.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />

        {selectedCourse && (
          <BookingModal
            event={selectedCourse}
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
          />
        )}
      </div>
    </>
  );
};

export default Classes;
