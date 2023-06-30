import axios, { AxiosResponse } from 'axios';

interface FormData {
    name?: string;
    caseSuite: string[];
    manualTestCoverage: string;
    caseSource: string;
    generatedBy: string;
    mainTicket: string;
    manualTestEnvironment: string;
    preCondition: string;
    testStep: string;
    expectedResult: string;
    xRelease: string;
    Priority: string;
}

interface EnumOption {
    name: string;
    gid: string;
}

interface CustomField {
    name: string;
    gid: string;
    type: string;
    enum_options?: EnumOption[];
}

interface CustomFieldSetting {
    custom_field: CustomField;
}

export async function createJiraTask(formData: FormData, projectGid: string, email: string, apiKey: string) {
    const task_id_pattern = /(\d+)(\/f)?$/;
    const match = formData.mainTicket.match(task_id_pattern);

    if (!match) {
        throw new Error("Please provide jira task URL");
    }
    let name = "[MS] " + formData.name

    const result: any = await axios.post("https://aics-his.atlassian.net/rest/api/2/issue", 
        {
            "fields": {
                "project": {
                    "id": "10058"
                },
                "summary": name,
                "issuetype": {
                    "id": "10070"
                },
                "customfield_10014": "TC-6911",
                "customfield_10182": {"value":"MS Backlog"},
                "customfield_10187": {"value":"MS Backlog"},
                "customfield_10168": {"value":formData.generatedBy},
                "customfield_10166": formData.mainTicket,
                "customfield_10158": formData.caseSuite.map((value) => ({ value })),
                "customfield_10174": {"value":formData.manualTestCoverage},
                "customfield_10160": {"value":formData.manualTestEnvironment},
                "customfield_10159": {"value":formData.caseSource},
                "priority": {"id":"3"},
                "customfield_10155": formData.preCondition,
                "customfield_10156": formData.testStep,
                "customfield_10157": formData.expectedResult,
            }
        },
        {
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                username: email,
                password: apiKey
            }
        });
    console.log(result.response)
    const getIssue: any = await axios.get("https://aics-his.atlassian.net/rest/api/3/issue/"+result.data.key,{
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: email,
            password: apiKey
        }
    })
    const accountId = getIssue.data.fields.reporter.accountId;

    const putAssignee: any = await axios.put("https://aics-his.atlassian.net/rest/api/3/issue/"+result.data.key+"/assignee",
    {
        accountId: accountId,
    },
    {
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: email,
            password: apiKey
        }
    })
    return { task_url: result.data.key }
}
