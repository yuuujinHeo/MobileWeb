
export default async function getURL(){
    const port = ':11334';
    let apiUrl = process.env.NEXT_PUBLIC_LOCAL_API_URL;
    
    if(process.env.NEXT_PUBLIC_TEST_MODE){
        apiUrl = process.env.NEXT_PUBLIC_TEST_API_URL;
    }else{
        const currentURL = window.location.href;
        console.log(currentURL);
        if(currentURL.startsWith('http')){
            apiUrl = currentURL.split(':')[0] + ':' + currentURL.split(':')[1];
        }else{
            apiUrl = currentURL;
        }
    }

    console.log("setMobileURL : ",apiUrl+port);
    return apiUrl+port;
}