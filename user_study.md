# User Study Report — The Humor Project

Week 9 Assignment
Date: March 26, 2026

# User Study 1

User Information

- Relationship: Classmate from ML COMS 4771
- Prior use of this app: None
- Experience with similar applications: Moderate — has used Reddit but nothing within our caption-rating domain

Observation Context

- Location: Dorm (EC)
- Device: Personal MacBook Pro, Google Chrome browser
- Instructions given: "This is a web app I built. Sign in and explore it however feels natural. I'll just watch."
- Task type: Free exploration — no prescribed tasks

Three Things the User Liked

- Voting feedback was immediate. The user noticed that upvote and downvote counts updated instantly without a page reload. They clicked several votes in quick succession and refreshed to test responsiveness.
- The sign-in process was straightforward. The user clicked "Sign in with Google," completed the OAuth flow, and was redirected to the captions feed without any confusion.
- The user enjoyed our compact the information was since there's three captions per row and many rows back to back. 

Three Areas for Improvement

- No instructions or onboarding on the main feed. The user landed on the captions feed after login and spent roughly 20 seconds scanning the page trying to find out what to do. 
- The "Upload Image" button is easy to miss on smaller screens. The user initially scrolled past the header and did not notice the upload button until they had browsed.
- The captions didn't have their corresponding image and basically were rendered useless to rate without the context. 

Observed Friction or Confusion

- The user paused on the main feed after login, clearly reading the page but unsure what action to take first.

- After captions were generated and they navigated back to the main feed, they scrolled to find the captions they had just created and seemed uncertain whether they had actually been saved. They eventually found them but it took about a minute of browsing. This would've been cleared up easily if the images were also shown. 
- The user misread the vote counter: they initially thought the number next to the vote buttons was the total number of voters rather than the net vote score.

Behavioral Observations

- Looked at the header first, then immediately scrolled started scrolling before actually doing anything.
- Tried upvoting several captions before exploring the upload functionality.
- They asked for guidance here since there wasn't any clear next place to go. 
- After seeing the generated captions on the upload page, clicked the "Upload Another Image" button to confirm it reset the form, then navigated back rather than uploading again.
- Did not explore pagination until prompted.

# User Study 2

User Information

- Relationship: Friend (non-CS background, political science)
- Prior use of this app: None
- Experience with similar applications: None

Observation Context

- Location: EC dorm again
- Device: Personal iPhone 17 (mobile browser, Safari)
- Instructions given: "Just use it like you would any app. Try to do whatever seems interesting. I'll watch and won't help unless you get totally stuck."
- Task type: Free exploration, with softly pushing them to try uploading an image if they felt comfortable

Three Things the User Liked

- The dark theme. The user noted that the design looked more serious, and quickly felt comfortable navigating because the visual hierarchy was clear.
- The Google sign-in removed friction since OAuth was finished quickly and they've seen this sign up structure from other websites they use. 
- The upload flow felt guided. When they uploaded a photo from their camera roll, there was only really one decision for the user to do.

Three Areas for Improvement

- The file input on mobile was awkward since the preview was cut off on the right side because the image container wasn't fully responsive.
- Vote buttons were small on mobile. 
- No confirmation after voting. The user voted on several captions and then asked, "Did that go through?" even though the button changed color. 

Observed Friction or Confusion

- Didn't recognize my UNI. 
- Had to zoom in on mobile instead of viewing many different captions. 
- After a misclick on the downvote, the user looked confused when the vote counter went negative; they tapped upvote to correct it, which toggled off the downvote but didn't register an upvote, leaving them at zero.
- Navigating between pages of captions required precise taps on the small Previous/Next links, which the user missed twice.

Behavioral Observations

- Started by reading the entire login page before tapping anything.
- Scrolled through roughly 15 captions before voting on one.
- Discovered the upload button only when I pointed it out.
- When captions finished generating, did not tap on individual captions — seemed to expect that tapping a caption would do something like expand it or copy it.

# User Study 3

User Information

- Relationship: friend (econ major)
- Prior use of this app: None
- Experience with similar applications: Moderate — uses Reddit and Twitter/X regularly 

Observation Context

- Location: Butler 2nd floor cafe study lounge area
- Device: Personal MacBook Pro, Google Chrome browser
- Instructions given: "I made a web app for a class project. Can you just explore it and see what is intuitive and what isn't"
- Task type: Free exploration — no prescribed tasks

Three Things the User Liked

- The Google sign-in was quick.
- The layout was easy to scan. The three-column grid let them move through a lot of captions quickly and they said it felt similar to browsing a feed they were used to.
- The vote buttons responded immediately. The user clicked upvote on a few captions and noticed the counter update right away, which they said felt clean.

Three Areas for Improvement

- The captions had no context and couldn't figure out that each caption was tied to an uploaded image. Without seeing the image, they weren't sure what they were even rating.
- The upload button wasn't noticed for a while. They were just voting before discovering the Upload Image button in the top right corner.
- The user didn't think that having the date that the caption was added was particularly useful. 

Observed Friction or Confusion

- Clicked on a caption card expecting it to open something or show more detail.
- Found the Previous/Next pagination at the bottom but hovered over it for a moment before clicking, as if unsure whether it would navigate away from the page entirely. They said it looked really rushed. 

Behavioral Observations

- Scrolled through the full first page before voting on anything.
- Once they started voting, moved through captions quickly and didn't second-guess clicks.
- Uploaded one image and watched the status messages without trying to click away during processing, as expected.
- After captions were generated, went back to the main feed and tried to find their uploaded captions but it should be made more clear that they would be the most recent one. Again the picture would help. 

# Final Summary

What I Learned from Observing Users

Watching three people with different backgrounds use the application revealed a consistent pattern: the app communicates what it shows but not what it does. The upload feature was mostly ignored until prompted, and the relationship between captions and their source images was unclear to all three users.

Surprising Findings

- I was surprised by how much the absence of any onboarding or contextual labels affected discovery. I had assumed the interface was self-explanatory, but all three users had to infer behavior from visual affordances that weren't strong enough on their own.

Patterns Across Multiple Users

- All three users signed in (to my account) without difficulty — the Google OAuth flow was smooth.
- All three users took a passive scanning approach before interacting — they read content before clicking anything.
- None of the three users discovered the upload feature without external prompting or extended exploration.

Planned Improvements

- Add a brief onboarding banner or tooltip on first login. 
- Show a thumbnail of the source image on each caption card. All three users wanted to know what image a caption was written for. Adding a small image thumbnail or linking the caption card to the source image would make the feed more meaningful and address the "What is this a caption for?" confusion directly.
- Increase vote button tap target size and add a brief confirmation state.  Enlarging the touch targets and adding a brief animation or checkmark on successful vote submission would reduce misclicks. 
- Clarify or relocate the user email display. The header currently shows the authenticated user's full email address. I would put it in a drop down somewhere. 
- Improve pagination affordance. Multiple users missed or misunderstood the Previous/Next pagination links. Making these more visually prominent with larger text, button styling, or a visible page indicator would help.