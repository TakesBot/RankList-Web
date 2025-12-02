'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

// --- 类型定义 ---
type Player = {
  user_name: string;
  player_rating: number;
  icon_id: number;
  extra_col: number;
  rankText: string;
  rank_index: number; // 动态排名（根据排序模式）
};

type SortType = 'rating' | 'rank';

// --- 样式常量（保持不变）---
const STATIC_RAINBOW_TEXT =
    "bg-[linear-gradient(90deg,#ff0040_0%,#ff8c00_14.3%,#ffd700_28.6%,#00ff80_42.9%,#0080ff_57.2%,#8000ff_71.5%,#ff1493_85.7%,#ff0040_100%)] " +
    "bg-clip-text text-transparent font-black tracking-wider";
const BRIGHT_GOLD_TEXT = "bg-gradient-to-b from-yellow-100 via-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_0_2px_rgba(253,224,71,0.5)] font-bold";

const getRatingStyle = (rating: number): string => {
  if (rating >= 15000) return STATIC_RAINBOW_TEXT;
  if (rating >= 14500) return BRIGHT_GOLD_TEXT;
  if (rating >= 14000) return "text-amber-400";
  if (rating >= 13000) return "text-slate-300";
  if (rating >= 12000) return "text-[#cd7f32]";
  if (rating >= 10000) return "text-purple-400";
  if (rating >= 7000) return "text-red-500";
  if (rating >= 4000) return "text-yellow-500";
  if (rating >= 2000) return "text-emerald-400";
  if (rating >= 1000) return "text-blue-400";
  return "text-neutral-400";
};

// --- 半角转全角工具函数 ---
const toFullWidth = (input: string): string => {
  if (!input) return '';

  let result = '';
  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);
    if (charCode === 32) {
      result += String.fromCharCode(12288);
    } else if (charCode >= 33 && charCode <= 126) {
      result += String.fromCharCode(charCode + 65248);
    } else {
      result += input.charAt(i);
    }
  }
  return result;
};

// --- 骨架屏组件 ---
const TableSkeleton = () => (
    <>
      {Array.from({ length: 15 }).map((_, i) => (
          <tr key={i} className="animate-pulse border-t border-neutral-800">
            <td className="px-4 py-3"><div className="h-5 w-6 mx-auto bg-neutral-700/50 rounded" /></td>
            <td className="px-4 py-3 flex justify-center">
              <div className="h-12 w-12 bg-neutral-700/50 rounded-md" />
            </td>
            <td className="px-4 py-3"><div className="h-5 w-24 bg-neutral-700/50 rounded" /></td>
            <td className="px-4 py-3"><div className="h-5 w-12 mx-auto bg-neutral-700/50 rounded" /></td>
            <td className="px-4 py-3"><div className="h-5 w-16 mx-auto bg-neutral-700/50 rounded" /></td>
          </tr>
      ))}
    </>
);

// --- 段位徽章组件 ---
const RankBadge = ({ rankText }: { rankText: string }) => {
  const text = rankText.toUpperCase();

  if (text.includes('LEGEND')) {
    return (
        <span className="inline-block px-2 py-0.5 rounded text-xs font-black border border-yellow-500/50 bg-neutral-800/80">
          <span className={STATIC_RAINBOW_TEXT}>{rankText}</span>
        </span>
    );
  }

  let colorClass = "text-neutral-400 border-neutral-600 bg-neutral-800";
  if (text.includes('S')) colorClass = "text-amber-400 border-amber-500/30 bg-amber-500/10";
  else if (text.includes('A')) colorClass = "text-red-500 border-red-500/30 bg-red-500/10";
  else if (text.includes('B')) colorClass = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";

  return (
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${colorClass}`}>
        {rankText}
      </span>
  );
};

// --- 主组件 ---
export default function Home() {
  const [data, setData] = useState<Player[]>([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortType>('rating');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // 根据模式构建API URL
  const getApiUrl = () => {
    if (isSearching && searchInput.trim()) {
      return `/api/rank?keyword=${encodeURIComponent(toFullWidth(searchInput))}&sort=${sort}`;
    }
    return `/api/rank?page=${page}&sort=${sort}`;
  };

  // 加载数据
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);

    fetch(getApiUrl(), { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error('Err');
          return res.json();
        })
        .then((data) => setData(Array.isArray(data) ? data : []))
        .catch((err) => {
          if (err.name !== 'AbortError') setError(true);
        })
        .finally(() => {
          setLoading(false);
        });

    return () => controller.abort();
  }, [page, sort, isSearching, searchInput]);

  // 触发搜索
  const handleSearch = () => {
    const keyword = searchInput.trim();
    if (!keyword) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    setPage(1);
  };

  // 处理输入框回车
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 清除搜索
  const handleClearSearch = () => {
    setSearchInput('');
    setIsSearching(false);
    setPage(1);
  };

  // 分页控制
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || isSearching) return;
    setPage(newPage);
  };

  // 渲染搜索结果提示
  const renderSearchInfo = () => {
    if (!isSearching) return null;

    const resultCount = data.length;
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 px-4 py-2 bg-neutral-800/60 rounded-lg border border-neutral-700">
          <div className="text-sm text-neutral-300">
            搜索 "<span className="text-cyan-400 font-medium">{searchInput}</span>"
            <span className="ml-2 text-neutral-500">(已自动转换为全角匹配)</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-400">找到 {resultCount} 条结果</div>
            <button
                onClick={handleClearSearch}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              清除搜索
            </button>
          </div>
        </div>
    );
  };

  return (
      <main className="min-h-screen bg-neutral-900 text-neutral-100 pb-20">
        <h1 className="text-3xl font-bold text-center pt-12 pb-8 tracking-tight">
          塔可Bot <span className="text-cyan-400">排行榜</span>
        </h1>

        <div className="max-w-5xl mx-auto px-4">
          {/* 搜索框 */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="搜索玩家名称（自动转换半角/全角）"
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg
                         text-neutral-100 placeholder-neutral-500
                         focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500
                         transition-colors"
              />
              <div className="mt-1 text-xs text-neutral-500">
                提示：输入半角英文/数字会自动转换为全角进行数据库匹配
              </div>
            </div>
            <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-neutral-700
                       rounded-lg text-white font-medium transition-colors whitespace-nowrap"
            >
              搜索
            </button>
          </div>

          {/* 搜索状态提示 */}
          {renderSearchInfo()}

          {/* 排序切换及分页状态（搜索模式下隐藏分页）*/}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="bg-neutral-800 p-1 rounded-lg inline-flex ring-1 ring-white/10">
              {(['rating', 'rank'] as const).map((s) => (
                  <button
                      key={s}
                      onClick={() => { setSort(s); setPage(1); }}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                          sort === s
                              ? 'bg-neutral-700 text-cyan-400 shadow-sm'
                              : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                  >
                    {s === 'rating' ? '按 Rating' : '按段位'}
                  </button>
              ))}
            </div>
            {!isSearching && (
                <span className="text-sm text-neutral-500">
                Page <span className="text-neutral-200 font-mono">{page}</span>
              </span>
            )}
          </div>

          {/* 表格主体 */}
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm whitespace-nowrap">
                <thead className="bg-neutral-800/80 backdrop-blur text-neutral-400 font-medium">
                <tr>
                  <th className="px-4 py-4 w-16">#</th>
                  <th className="px-4 py-4 w-20">Icon</th>
                  <th className="px-4 py-4 text-left">Player</th>
                  <th className="px-4 py-4 text-center">Rating</th>
                  <th className="px-4 py-4 text-center">Rank</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                {error ? (
                    <tr><td colSpan={5} className="py-12 text-center text-red-400">加载失败</td></tr>
                ) : loading ? (
                    <TableSkeleton />
                ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-neutral-500">
                        {isSearching
                            ? `未找到匹配的玩家 "${searchInput}"`
                            : '暂无数据'}
                      </td>
                    </tr>
                ) : (
                    data.map((p, i) => {
                      // 核心：直接使用后端返回的 rank_index
                      const rankIndex = p.rank_index;
                      const ratingStyle = getRatingStyle(p.player_rating);
                      const displayRating = p.player_rating > 17000 ? '***' : p.player_rating.toLocaleString();

                      return (
                          <tr key={`${p.user_name}-${i}`} className="group hover:bg-neutral-800/40 transition-colors">
                            <td className="px-4 py-3 text-center text-neutral-500 font-mono group-hover:text-neutral-300">
                              {rankIndex}
                            </td>
                            <td className="px-4 py-3 flex justify-center">
                              <div className="relative w-12 h-12 ring-1 ring-white/10 rounded-md overflow-hidden">
                                <Image
                                    src={`https://assets2.lxns.net/maimai/icon/${p.icon_id}.png`}
                                    alt="icon"
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                    unoptimized
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium text-neutral-200">
                              {p.user_name}
                            </td>
                            <td className={`px-4 py-3 text-center text-base font-mono ${ratingStyle}`}>
                              {displayRating}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <RankBadge rankText={p.rankText} />
                            </td>
                          </tr>
                      );
                    })
                )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 分页按钮（搜索模式下隐藏） */}
          {!isSearching && data.length > 0 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || loading}
                    className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-sm"
                >
                  上一页
                </button>

                <div className="flex gap-2">
                  {[page - 1, page, page + 1].map((p) => (
                      p >= 1 && (
                          <button
                              key={p}
                              onClick={() => handlePageChange(p)}
                              disabled={loading}
                              className={`w-9 h-9 rounded flex items-center justify-center text-sm font-medium transition-all ${
                                  page === p
                                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
                                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                              }`}
                          >
                            {p}
                          </button>
                      )
                  ))}
                </div>

                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={loading || data.length < 20}
                    className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-sm"
                >
                  下一页
                </button>
              </div>
          )}
        </div>
      </main>
  );
}