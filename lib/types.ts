export const headers = [
    'acadYear',
    'description',
    'title',
    'additionalInformation',
    'department',
    'faculty',
    'workload',
    'gradingBasisDescription',
    'moduleCredit',
    'moduleCode',
    'semesterData',
    'preclusion',
    'preclusionRule',
    'prerequisite',
    'prerequisiteRule',
    'attributes',
    'fufillRequirements',
    'prereqTree',
    'corequisite',
    'corequisiteRule',
    'prerequisiteAdvisory',
    'aliases'
];

export type DetailedModuleInfo = {
    acadYear: string;
    description: string;
    title: string;
    additionalInformation: string;
    department: string;
    faculty: string;
    workload: string;
    gradingBasisDescription: string;
    moduleCredit: number;
    moduleCode: string;
    semesterData: 
        {
            semester: number;
            timetable:
                {
                    classNo: string;
                    startTime: string;
                    endTime: string;
                    weeks: number[];
                    venue: string;
                    day: string;
                    lessonType: string;
                    size: number;
                    covidZones: string;
                }[];
            covidZones: string;
        }[];
    preclusion: string;
    preclusionRule: string;
    prerequisite: string;
    prerequisiteRule: string;
    attributes: string;
    fufillRequirements: string;
    prereqTree: string;
    corequisite: string;
    corequisiteRule: string;
    prerequisiteAdvisory: string;
    aliases: string;
}

export type Module = {
    code: string;
    title: string;
    semesters: string;
}

export type ModuleSchedule = {
    moduleCode: string;
    moduleTitle: string;
    description: string;
    lessons: {
        lessonType: string;
        lessonNumber: string;
        startTime: string;
        endTime: string;
        venue: string;
        day: string;
        size: number;
        weeks: number[];
    }[];
}

export type CustomEvent = {
    eventName: string,
    eventDescription: string,
    eventLocation: string,
    isRecurring: boolean,
    startDateAndTime: Date,
    endDateAndTime: Date,
    dayOfWeek: string,
    recurringStartTime: {
        hour: string,
        minute: string,
    },
    recurringEndTime: {
        hour: string,
        minute: string,
    },
    weeks: number[],
    type: string,
    color: string,
};

export type LessonRecord = Record<string, Record<string, string | undefined>>;