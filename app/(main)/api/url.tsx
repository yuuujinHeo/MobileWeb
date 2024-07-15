
export async function getMobileAPIURL(){
    const port = ':11334';
    let apiUrl = process.env.NEXT_PUBLIC_LOCAL_API_URL;
    
    if(process.env.NEXT_PUBLIC_TEST_MODE == "true"){
        apiUrl = process.env.NEXT_PUBLIC_TEST_API_URL;
    }else{
        const currentURL = window.location.href;
        console.log("current : ", currentURL);
        if(currentURL.startsWith('http')){
            apiUrl = currentURL.split(':')[0] + ':' + currentURL.split(':')[1];
        }else{
            apiUrl = currentURL;
        }
    }

    console.log("getMobileAPIURL : ",apiUrl+port, process.env.NEXT_PUBLIC_TEST_MODE);
    return apiUrl+port;
}

