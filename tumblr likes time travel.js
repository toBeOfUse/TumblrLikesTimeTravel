document.querySelectorAll("[data-id]").forEach(v=>v.style.display="none");
let oldFetch = fetch;
fetch = async function(){  // creating a dummy fetch function that resolves to a homebrew response upon requests for likes
	if(arguments[0].indexOf("https://www.tumblr.com/api/v2/user/likes") == 0){
		console.log("detected likes request; intercepting that sucker");
		// obtain the default response to this request for likes:
		let resp = await oldFetch.apply(window, arguments);
		let j = await resp.json();
		// modify the default response to contain no posts and shift us backwards in time:
		j.response.likedPosts = [];
		let datestring = prompt("enter a date in the format matching how today's date is displayed here: "+new Date().toLocaleDateString());
		let date = new Date(datestring);
		date.setHours(23, 59, 59)
		let before = ""+(Math.round(date.getTime()/1000));
		if("before" in j.response.links.next.queryParams){
			j.response.links.next.href = j.response.links.next.href.replace(/before=\d+/, "before="+before);
		}else{
			j.response.links.next.href += "&before="+before;
		}
		j.response.links.next.queryParams.before = before;
		let newResp = new Response(JSON.stringify(j), {status: 200, statusText: "OK", headers: resp.headers});
		window.fetch = oldFetch;
		return newResp;
	}else{  // default back to normal fetch functionality for all other requests
		return await oldFetch.apply(window, arguments);
	}
}
window.dispatchEvent(new CustomEvent('scroll'));