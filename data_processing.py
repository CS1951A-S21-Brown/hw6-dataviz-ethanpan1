import pandas as pd

video_games = pd.read_csv("data/video_games.csv")
genre_sales = video_games.groupby('Genre').sum()
genre_sales.to_csv("data/genre_sales.csv")

recent_games = video_games[video_games['Year'] >= 2007]
recent_games = recent_games[recent_games['Year'] <= 2016]

d = {}
for genre in video_games.Genre.unique():
  genre_by_pub = recent_games[recent_games['Genre'] == genre]
  d[genre] = genre_by_pub.groupby('Publisher').sum().sort_values(by='Global_Sales', ascending = False)[0:5].index.tolist()


genre_publisher_sales = recent_games[recent_games.apply(lambda row: row['Publisher'] in d[row['Genre']], axis = 1)]
genre_publisher_sales = genre_publisher_sales.groupby(['Genre','Year','Publisher']).sum()
genre_publisher_sales['Global_Sales'] = genre_publisher_sales['Global_Sales'].round(2)
genre_publisher_sales.drop(['Rank', 'NA_Sales','EU_Sales','JP_Sales','Other_Sales'], axis = 1, inplace = True)

count = 0
for genre in recent_games.Genre.unique():
  for year in recent_games.Year.unique():
    for publisher in d[genre]:
      if (genre,year,publisher) not in genre_publisher_sales.index:
        genre_publisher_sales.loc[genre,year,publisher] = 0

genre_publisher_sales.sort_values(by=['Genre','Year', 'Publisher'], inplace = True)

genre_publisher_sales.to_csv("data/genre_publisher_sales.csv")
