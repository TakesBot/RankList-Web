import db from '@/lib/mysql';
import rankText from '@/lib/rankText';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;

    // 支持 ?sort=rating 或 ?sort=rank，默认 rating
    const sort = searchParams.get('sort') ?? 'rating';

    // 支持 ?keyword=xxx 进行全量搜索
    const keyword = searchParams.get('keyword');

    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
    const limit = 20;
    const offset = (page - 1) * limit;

    // 根据 sort 参数决定排名方式
    const rankClause = sort === 'rank'
        ? 'ROW_NUMBER() OVER (ORDER BY extra_col DESC)'
        : 'ROW_NUMBER() OVER (ORDER BY player_rating DESC)';

    // 验证 sort 参数，防止 SQL 注入（只允许两种值）
    const orderByClause = sort === 'rank' ? 'extra_col DESC' : 'player_rating DESC';

    let query: string;
    let params: any[];

    // 基础查询：包含动态计算的排名
    const baseQuery = `
        SELECT user_name, player_rating, icon_id, extra_col,
               ${rankClause} as rank_index
        FROM user_preview
    `;

    if (keyword) {
        // 搜索模式：返回所有匹配结果，不分页
        query = `
            WITH RankedData AS (${baseQuery})
            SELECT * FROM RankedData
            WHERE user_name LIKE ?
            ORDER BY ${orderByClause}
        `;
        params = [`%${keyword}%`]; // 模糊匹配
    } else {
        // 正常分页模式
        query = `
            WITH RankedData AS (${baseQuery})
            SELECT * FROM RankedData
            ORDER BY ${orderByClause}
                LIMIT ? OFFSET ?
        `;
        params = [limit, offset];
    }

    const [rows] = await db.query(query, params);

    // 给每条数据加上实时段位
    const data = (rows as any[]).map(r => ({
        ...r,
        rankText: rankText(r.extra_col),
    }));

    return Response.json(data);
}