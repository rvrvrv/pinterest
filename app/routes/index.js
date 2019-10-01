const path=process.cwd(),ClickHandler=require(`${path}/app/controllers/clickHandler.server`);module.exports=(a,b)=>{function c(a,b,c){return console.log("req.session at isLoggedIn: ",a.session),a.session.passport===a.session.userId?c():null}const d=new ClickHandler;// Homepage
// Logout route
// Twitter auth routes
// Retrieve all pins in collection
// Get user information
// Like & unlike pin routes
// Add & remove pin routes
a.get("/",(a,b)=>{b.sendFile(`${path}/public/index.html`)}),a.get("/logout",(a,b)=>{a.session.reset(),b.redirect("/")}),a.get("/auth/twitter",b.authenticate("twitter")),a.get("/auth/twitter/callback",(a,c,d)=>{b.authenticate("twitter",(b,e)=>b?d(b):e?a.logIn(e,b=>b?d(b):(a.session.passport=e.id,a.session.userId=e.id,a.session.userName=e.name,c.redirect("/"))):c.send("error"))(a,c,d)}),a.route("/api/allpins/").get((a,b)=>d.getAllPins(a,b)),a.get("/api/:id?",c,(a,b)=>{d.loadUser(a,b)}),a.route("/api/like/:obj").put(c,(a,b)=>{d.likePin(a.session.userId,a.params.obj,b)}).delete(c,(a,b)=>{d.unlikePin(a.session.userId,a.params.obj,b)}),a.route("/api/pin/:pinUrl/:pinCaption?").post(c,(a,b)=>d.addToCollection(a,b)).put(c,(a,b)=>{d.addPin(a.session,decodeURIComponent(a.params.pinUrl),decodeURIComponent(a.params.pinCaption),b)}).delete(c,(a,b)=>{d.delPin(a.session,decodeURIComponent(a.params.pinUrl),b)})};