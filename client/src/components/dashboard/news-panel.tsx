import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTimeAgo } from "@/lib/utils";
import { api } from "@/lib/api";
import type { NewsArticle } from "@shared/schema";

export default function NewsPanel() {
  const { data: articles, isLoading } = useQuery<NewsArticle[]>({
    queryKey: ["news"],
    queryFn: () => api.news.getNewsArticles(),
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Latest News & Updates</h3>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex space-x-4 p-4">
                <div className="w-16 h-16 bg-slate-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!articles?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Latest News & Updates</h3>
          </div>
          <p className="text-slate-500">No news articles available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Latest News & Updates</h3>
          <Button variant="ghost" className="text-primary hover:text-blue-700">
            View All
          </Button>
        </div>
        
        <div className="space-y-4">
          {articles.map((article) => (
            <article
              key={article.id}
              className="flex space-x-4 p-4 hover:bg-slate-50 rounded-lg transition-colors duration-200"
            >
              {article.imageUrl && (
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-slate-800 mb-1">{article.title}</h4>
                <p className="text-sm text-slate-600 mb-2">{article.summary}</p>
                <div className="flex items-center text-xs text-slate-500">
                  <span>{formatTimeAgo(new Date(article.publishedAt))}</span>
                  <span className="mx-2">•</span>
                  <span>{article.category}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
