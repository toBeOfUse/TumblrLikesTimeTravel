function askForDate(){
	let datestring = prompt("enter a date in the format matching how today's date is displayed here: "+new Date().toLocaleDateString());
	let date = new Date(datestring);
	return ""+(date.getTime()/1000);
}

window._likesTimeShifted = false;  // flag determining whether we've finished the job yet

let oldFetch = fetch;
fetch = function(){  // creating a dummy fetch function that resolves to a homebrew response upon requests for likes
	return new Promise(async (resolve, reject) => {
		if(arguments[0].indexOf("https://www.tumblr.com/api/v2/user/likes") == 0 && !window._likesTimeShifted){
			console.log("detected likes request; intercepting that sucker");
			// obtain the default response to this request for likes:
			let resp = await oldFetch.apply(window, arguments);
			let j = await resp.json();
			// modify the default response to contain no posts and shift us backwards in time:
			j.response.likedPosts = [];
			let before = askForDate();
			if("before" in j.response.links.next.queryParams){
				j.response.links.next.href = j.response.links.next.href.replace(/before=\d+/, "before="+before);
			}else{
				j.response.links.next.href += "&before="+before;
			}
			j.response.links.next.queryParams.before = before;
			let newResp = new Response(JSON.stringify(j), {status: 200, statusText: "OK", headers: resp.headers});
			window._likesTimeShifted = true;  // we have finished the job
			resolve(newResp);
		}else{  // default back to normal fetch functionality for all other requests
			resolve(await oldFetch.apply(window, arguments));
		}
	});
}