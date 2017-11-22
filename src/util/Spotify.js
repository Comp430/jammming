const clientId = '8b6ac7aec4254fcfb52491e0b3bded67';
const redirectUri = 'http://localhost:3000/';
let accessToken;

const Spotify = {
  getAccessToken(){
    if(accessToken){
      return accessToken;
    }

    const matchToken=window.location.href.match(/access_token=([^&]*)/);
    const matchExpire=window.location.href.match(/expires_in=([^&]*)/);
    if(matchToken && matchExpire){
      accessToken=matchToken[1];
      const expireTime=Number(matchExpire[1]);
      window.setTimeout(()=>accessToken='',expireTime*1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    }else{
      window.location=`https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
    }
  },

  search(term){
    const accessToken=Spotify.getAccessToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,{
      headers:{
        Authorization: `Bearer ${accessToken}`
      }
    }).then(response=>{
      return response.json();
    }).then(jsonResponse=>{
      if(!jsonResponse.tracks){
        return [];
      } return jsonResponse.tracks.items.map(track=>({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
      }));
    });
  },

  savePlaylist(name,trackURIs){
    const accessToken=Spotify.getAccessToken();
    const headers={Authorization: `Bearer ${accessToken}`};
    let userID;

    return fetch('https://api.spotify.com/v1/me',
    {headers: headers}).then(response=>response.json()).then(jsonResponse=>{
      userID=jsonResponse.id;
      return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`,{
        headers: headers,
        method: 'POST',
        body: JSON.stringify({
          name: name
        })
      }).then(response=>response.json()).then(jsonResponse=>{
          const playlistId = jsonResponse.id;
          return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistId}/tracks`,{
            headers: headers,
            method: 'POST',
            body: JSON.stringify({
              uris: trackURIs
          })
        });
      });
    });
  }

}

export default Spotify;
