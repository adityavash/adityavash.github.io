##Project Name
Visualizing Participation Growth of a Social Media Platform in India
##Team Members
1. Aditya Vashistha adityav@cs.washington.com
2. Sam Sudar sudars@cs.washington.com

##Description of Final Interactive Visualization Application
 
<Add images here>
In this visualization, we show the participation growth of a voice based social media platform for low-literate low-income communities in India. The visualization depicts the total number of calls from people from in different Indian states over the course of 11 weeks of deployment. 

In the visualization, total number of calls from each state is divided in seven quantiles. Each quantile has a shade of blue with higher numbers represented with darker shades. For each week, the states are colored on the basis of the quantile to which the cumulative number of calls for that state belong. A viewer can adjust the time slider to understand the total participation across states over a period of 11 weeks. 

## Running Instructions

Put your running instructions here.  (Tell us how to open your visualization.) 

If your visualization is web-based,  it would be great if your submissions can be opened online. [Github Pages](http://pages.github.com/) is a good and easy way to put your visualization online so you can put your link here.  For example:

Access our visualization at http://cse512-14w.github.io/a3-jheer-kanitw/ or download this repository and run `python -m SimpleHTTPServer 9000` and access this from http://localhost:9000/.

(If you put your work online, please also write [one-line description and put a link to your final work](http://note.io/1n3u46s) so people can access it directly from CSE512-14W page.)


##Data Domain
###Dataset
From May-July 2013, we deployed a voice based social media platform for visually impaired communities and low-income, low-literate people in India. In the deployment, callers could call a number to record, listen, like, dislike and share audio content using an interactive voice response (IVR) system. Thus, people participated in the system by calling an IVR service number where the phone number of callers served as the unique identifier for their actions. The information about social media platform was initially told to a few dozen people but the participation grew steadily over the course of deployment. We have access to the data for the deployment, which lasted 72 days. In total, we received 37281 calls by 1521 people across India. 

###Interesting Questions
Though there are a lot of interesting questions which can be answered by means of an effective and expressive visualization, we are focusing our attention on the below questions. 
1. How did the participation grow over the course of the deployment? 
2. What was the participation growth for each state in India over the course of the deployment? 

By participation we simply mean the number of calls to our system. This is analogous to how many times people logged in to their social media accounts like Facebook or Twitter over a specific period of time. 

##Exploratory Data Analysis
###Data Appropriation
We spent much more time in exploratory data analysis than we anticipated. Firstly, the dataset was available to us as a SQL Server MDF file. Actions by all users of the social media platform was stored in one table with the below schema:

Session ID, Caller ID, Action, Content-Identifier, Timestamp

The action could be login, logout, like, dislike, record, listen, share by a caller. We wrote a basic SQL query to get login data for all the callers in the below format

Caller Id, Login timestamp

We saved the output of the SQL query in Caller-DateTime.csv file. Though now we have the record for all calls made to the social media platform by each caller, this data is sufficient only to answer question 1 (i.e. overall participation growth of the platform).

###Data Transformation
In order to answer question 2 (i.e. state-wise participation growth), we also need to map the location for each caller. 

We found a Wikipedia article describing mobile telephone numbering in India [cite]. According to the article, the first four digits of a mobile number represents the telecom circle corresponding to the location of a caller. Often, the telecom circle maps one on one with the state of residence of a caller. For example, the prefix ‘9632’ in a phone number 9632ABCDEF implies that the caller’s number is registered to the state of Karnataka which means  that the caller is a resident of the state Karnataka.  

We created a csv file by extracting mobile number prefix and geographic location mapping from the Wikipedia article. We have made the CSV publically available so that others doesn’t have to repeat the same efforts [cite]. 

For our visualization, we also needed the number of callers for each state in a specified time interval (every month, every week, every day etc.). Below is an example of the format in which we need the data. 

	Week 1	Week 2	Week 3	Week 4 ………
State 1	0	100	156	345
State 2	11	12	34	98
State 3	4	55	342	456
State 4	2	2	4	11
………..				

Here cell of the table represents the total number of calls received by all callers from state X in a week Y. 

In order to get the data in a format similar to the above example, we wrote a c# code (loc=500). The C# data wrangling and transformation code is uploaded to the GitHub repository. The CSV data files generated by the C# code and used in our visualization are available in www/app/data folder in our GitHub repository.

###Data Cleaning
The data in the database had some ill-formed numbers as well. By ill-formed, we mean that the number of digits in the phone number was less than 10. We have discarded calls from such numbers in the calculation. 

Total Calls	37283
Total Callers	1521
Total calls with ill-formed numbers	6824
Total callers with ill-formed numbers	130

Moreover, the phone number prefix and state mapping table had missing entries for a few prefixes. Hence, we have classified calls from such numbers in a new category called “undefined”.

##Storyboard
###Initial Ideas
Because we had an interesting dataset, we spent a couple of hours on brainstorming the visualization we want to make and the interaction techniques to be used to make the visualization effective and expressive. 

The first thought was to visualize the social media interactions (listen, like, dislike, share) between people in same state vs. people across the state. We also brainstormed about visualizing the growth of the social media platform for unique callers in each state as well as total calls in each state. However, we finally decided to visualize the overall growth (i.e. total calls) in each state over the time of deployment so that the amount of work to be done is in scope of the assignment.

We decided to visualize the data on the map of India. We found four interesting points while storyboarding. 
1. Though many SVG files for the map of India are available, the geographic regions in those SVG files are colored. We wanted a white background. Though there are several ways to overlay a white layer on a colored region, we found it relatively easier and much more fun to create our own map in D3. 
2. The number of total calls in our dataset corresponds to a telecom circle rather than a state. Thus, in some cases, multiple states fall into one calling region.  
3. For the same reason as above, one particular state is divided in two telecom circles. We have aggregated numbers for such circles into one state. 
4. There are four metro cities in India. All the four cities have their own telecom circle. However, for the visualization, we have integrated the data for the metro cities in the data corresponding to their respective states. 

Our first thought was to use a circle for each state where area of a circle will be directly proportional to the total calls received by that state/calling region. We also decided to implement a time slider, which when adjusted would change the size of the circles to depict the total calls (and thus participation) from each state at that moment in time. Below is the scanned image of our first design.

 
Though this seems an effective visualization as size is used to describe the participation growth over a period of time, the problem is occlusion. Some small states like Delhi consist of 1% of India’s area, 1.8% of India’s population but the participation in the social media platform is close to 5%. Thus, in an actual visualization, the circle for New Delhi will overlap with the circles corresponding to neighboring states. This is all the more probable, as the participation from north Indian states was significantly more than other regions of the country. Though we can solve this problem by changing the scale, but it would impact the effectiveness of the visualization. In order to avoid the problem of occlusion, we tried brainstorming the use of bar charts. In our second design, we considered using bar charts where the length of bars would be directly proportional to the total calls from respective state at a particular moment in time. We also decided to retain the time slider in each of our design. 
 
We were not satisfied with this design either. Moreover, the data could still be occluded using bar charts. However, we found bars to be more expressive than circles as bar could also include total calls (as length of the bar) and unique calls (as width of the bar). One of the approaches we thought to deal with occlusion problem in both design 1 and 2 was to position the circle or bar in such a way that the occlusion between circles or bars is minimized. However, as position is also used to convey information in visualization, randomly choosing the position to place a circle or a bar will affect the expressiveness of the visualization.

Another alternative we discussed was to use dots to represent the number of calls in each calling region. But this also doesn’t appear to be effective. Moreover, the number of dots in each line must be same so as to avoid conveying any unintended meaning. This design seemed to be the most ineffective of all the designs so far considered. 
 
Another alternative was to use different colors for overlapping circles but the visualization (see below) created 1+1 = 3 effect using different colors was confusing and conveying unintended information. However, use of different transparency in overlapping circles would make more sense. 

 

###Final Design
Finally, we converged on using a choropleth map with a slider to see the participation growth of the social media platform. To us, this seemed to be the most expressive and most effective visualization design among all the options. We also decided to use either a geometric progression or a quantile scale to map the color. 
 



##Implementation Details

###Implementation
The visualization is implemented using D3. The most challenging aspect of creating the visualization was obtaining a high quality SVG map of Indian states. Our data was tabulated by state names, and the elements in the SVG needed to be referenced by state names. In order to generate the map, we used country and state-level data from NaturalEarth, spurred on an excellent tutorial from Mike Bostock (http://bost.ocks.org/mike/map/). 

The first dataset was filtered on India, giving the outline of the country. This ended up being unnecessary due to the fact that the states themselves completely defined the territory of India. The states were filtered using the ogr2ogr command line tool. The program selected all those objects that were in India, and were of type “State”. Due to errors in the dataset, the state Gujarat was of type null and had to be explicitly requested. Similarly, Delhi is a union territory rather than a state, and its type was labeled “Union Territor”. ogr2ogr combined both datasets into a single GeoJSON file, which was then converted using Mike Bostock’s NodeJS command line tool topojson into a TopoJSON file. TopoJSON is preferable because it is a more compact representation and is used by Mike Bostock in his tutorials, thereby making it an easy model to build upon. D3 was used to append an SVG and draw the paths. The states were rendered with a minimal amount of scaling. 

The next step was to map the call data from our CSV to individual states. Because some call records comprised multiple states, we implemented an extra level of indirection where a single row referred to ‘n’ state names. These names were the same as the class attributes of the states in the SVG, so selecting and styling individual states was straight forward using D3’s select and style functions.

For reasons explained above, the most effective visualization of calling numbers was deemed to be changes in hue. The exact values were taken from yet another Mike Bostock example, as the values were visually appealing and exist on a gradient along a single hue (http://bl.ocks.org/mbostock/4060606). Raw call numbers were mapped to a quantile using a D3 threshold scale.

The visualization is updated (i.e. colored) on the initial page load and on every subsequent movement of the slider. The slider position is mapped to a week, and then each state is colored based on the grouping.

We have used and implement following libraries
•	D3
•	queue
•	requires
•	jquery
•	topojson
•	ogr2ogr
•	jquery-ui

###Interaction Technique
We implemented a time slider. The values on our visualization changes as the time slider’s position is changed. 

###Color Gradient Scale
We tried using various scales (quartiles, quintiles, sextiles, 7 quantiles, 9 quantiles, log scale, manually chosen random progression, arithmetic progression, standard deviation calculation, and geometric progression). We tested each scale described above against the data for 3rd week, 6th week and 9th week. For our dataset, we found 7 quantiles and geometric progression to be most effective as we could see data variation in the visualization much better than other scales. 

Below is the table consisting of various values for each considered scale. For more details, please refer to color.xlsx in www/app/data in the GitHub repository.

##Work Division
Both Aditya and Sam contributed in each phase of the project in different capacities.  Aditya took the lead in data collection, data wrangling, coloring and documentation while Sam leaded the D3 map creation and interaction technique implementation. Both Sam and Aditya equally contributed in storyboarding and design discussions.  
We collectively spent around 70 man-hours on this assignment. The estimated breakup for individual unit is given below. 
•	Data Domain Selection – 1 man-hour
•	Exploratory Data Analysis– 6 man-hours
•	Story Boarding and Design Discussions – 6 man-hour
•	D3 Learning – 20 man-hour
•	Implementation – 30 man-hour 
•	Documentation – 4 man-hour

##Future Work
One interesting visualization would be to see patterns in likes and dislikes among people in same state and people across different state. It would be interesting to understand whether people in state X have preference for the content recorded by people in state Y. In future work, we would also implement more interaction techniques like brushing, selection, filtering etc.
 
##References
1.	http://en.wikipedia.org/wiki/Mobile_telephone_numbering_in_India
2.	Upload CSV on www.adityavashistha.com 
3.	URL of the code
4.	URL of weekly data 
5.	URL for daily data


